/*!
Non-Fungible Token implementation with JSON serialization.
NOTES:
  - The maximum balance value is limited by U128 (2**128 - 1).
  - JSON calls should pass U128 as a base-10 string. E.g. "100".
  - The contract optimizes the inner trie structure by hashing account IDs. It will prevent some
    abuse of deep tries. Shouldn't be an issue, once NEAR clients implement full hashing of keys.
  - The contract tracks the change in storage before and after the call. If the storage increases,
    the contract requires the caller of the contract to attach enough deposit to the function call
    to cover the storage cost.
    This is done to prevent a denial of service attack on the contract by taking all available storage.
    If the storage decreases, the contract will issue a refund for the cost of the released storage.
    The unused tokens from the attached deposit are also refunded, so it's safe to
    attach more deposit than required.
  - To prevent the deployed contract from being modified or deleted, it should not have any access
    keys on its account.
*/
use near_contract_standards::non_fungible_token::events::NftMint;
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LazyOption;
use near_sdk::{
    env, near_bindgen, require, AccountId, BorshStorageKey, PanicOnDefault, Promise, PromiseOrValue,
};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
}

const DATA_IMAGE_SVG_NEAR_ICON: &str = "data:image/svg+xml,%3C?xml version='1.0' encoding='UTF-8'?%3E %3Csvg width='700pt' height='700pt' version='1.1' viewBox='0 0 700 700' xmlns='http://www.w3.org/2000/svg'%3E %3Cg%3E %3Cpath d='m131.38 21.477c10.547 0 19.094 8.5469 19.094 19.09 0 9.668-7.1836 17.652-16.5 18.918l-2.5938 0.17578c-13.898 0-25.324 10.34-26.789 23.41l-0.15625 2.8398c0 10.543-8.5469 19.09-19.09 19.09-10.547 0-19.094-8.5469-19.094-19.09 0-35.598 29.281-64.434 65.129-64.434z'/%3E %3Cpath d='m177.11 460.38c9.6641-0.16016 17.766 6.8906 19.184 16.188l0.21875 2.5859c0.21875 13.387 10.641 24.398 24.035 25.809l2.9141 0.15234c10.543 0 19.09 8.5469 19.09 19.09s-8.5469 19.094-19.09 19.094c-35.516 0-64.543-28.238-65.125-63.512-0.17578-10.543 8.2305-19.23 18.773-19.406z'/%3E %3Cpath d='m177.11 460.38c9.6641-0.16016 17.766 6.8906 19.184 16.188l0.21875 2.5859c0.21875 13.387 10.641 24.398 24.035 25.809l2.9141 0.15234c10.543 0 19.09 8.5469 19.09 19.09s-8.5469 19.094-19.09 19.094c-35.516 0-64.543-28.238-65.125-63.512-0.17578-10.543 8.2305-19.23 18.773-19.406z'/%3E %3Cpath d='m220.41 543.1 3.0469 0.19531h276.84c35.445 0 64.516-28.633 64.516-63.828 0-10.543-8.5469-19.09-19.09-19.09h-276.23c-9.5508 0-17.488 7.0195-18.875 16.215l-0.21484 2.5586c-0.21875 13.387-10.637 24.398-24.035 25.809l-2.9141 0.15234c-24.395 0-25.41 35.066-3.0469 37.988zm297.36-44.547-1.9375 1.5547c-4.3594 3.1367-9.7305 5.0039-15.527 5.0039l-217.43-0.015625 0.68359-1.4258c0.51562-1.2266 1-2.4727 1.4414-3.7383l0.42188-1.3789z'/%3E %3Cpath d='m131.38 21.477c-35.848 0-65.129 28.836-65.129 64.434 0 10.543 8.5469 19.09 19.094 19.09h92.074c10.543 0 19.094-8.5469 19.094-19.09 0-17.367-6.9844-33.609-19.203-45.645-12.16-11.977-28.5-18.789-45.93-18.789zm3.6094 38.414c4.7305 0.61328 9.125 2.4297 12.859 5.2656l1.8984 1.6367h-36.781l0.35547-0.32812c4.7773-4.2188 11.109-6.8047 18.059-6.8047z'/%3E %3Cpath d='m191.5 61.094c2.6172 6.1875 4.2578 12.801 4.8086 19.648l0.21094 5.1719-0.003906 393.24c0.23828 14.344 12.18 25.961 26.949 25.961 13.785 0 25.109-10.121 26.75-23.129l0.19922-2.832c0.16016-9.5508 7.3125-17.367 16.527-18.605l2.5625-0.16797 180.38-0.011718 0.027344-108.86c0-9.668 7.1797-17.652 16.5-18.918l2.5898-0.17578c9.6641 0 17.652 7.1836 18.918 16.5l0.17188 2.5938v127.96c0 9.6641-7.1797 17.652-16.5 18.918l-2.5898 0.17188-183.58-0.011719-0.42188 1.3867c-8.4219 24.027-30.738 41.535-57.309 43.227l-4.2305 0.13672c-34.098 0-62.211-26.023-64.922-59.594l-0.20703-4.2344v-393.56c0-7.0078-2.7891-13.496-7.8086-18.441-4.2305-4.1641-9.6211-6.8125-15.531-7.5781l-6.6562-0.42578c-21.391-2.793-21.391-35 0-37.793l3.0469-0.19531h291.58c34.418 0 62.777 26.574 64.992 60.195l0.13672 4.2383v77.582c0 10.543-8.5469 19.09-19.09 19.09-9.6641 0-17.652-7.1797-18.918-16.5l-0.17188-2.5898v-77.582c0-13.422-10.5-24.656-24.012-26.094l-2.9375-0.15625-232.15-0.023437z'/%3E %3Cpath d='m458.42 147.09-2.293 1.043c-2.9492 1.5859-5.4453 3.9297-7.2188 6.8086l-24.254 39.348-11.02-24.457c-6.1328-13.59-24.773-15.223-33.176-2.9062l-64.617 94.754c-3.3672 4.9375-4.2266 11.168-2.3242 16.836l30.16 89.793c2.6133 7.7734 9.8984 13.012 18.098 13.012h88.293c3.2891 0 6.5273-0.85156 9.3945-2.4688l116.32-65.754 2.2656-1.5c9.1953-7.0469 10.117-20.984 1.3008-29.137l-21.52-19.902 4.1133-2.0195c3.7188-1.8477 6.7344-4.8516 8.5898-8.5664l68.914-137.88c7.7656-15.539-7.5742-32.535-23.824-26.395zm125.05-6.457-44.215 88.504-23.191 11.547-2.2656 1.3203c-9.9648 6.7383-11.371 21.328-2.207 29.797l22.625 20.922-89.168 50.402h-69.566l-22.758-67.785 40.094-58.801 11.859 26.266 1.3281 2.4688c7.3438 11.586 24.809 11.91 32.332-0.3125l39.676-64.492z'/%3E %3Cpath d='m478.42 217c7.6523-7.2539 19.734-6.9336 26.992 0.71875 6.5938 6.9531 6.9258 17.574 1.1836 24.895l-1.9023 2.0938-175.95 166.83c-7.6523 7.2578-19.734 6.9336-26.988-0.71484-6.5977-6.957-6.9297-17.574-1.1875-24.898l1.9023-2.0898z'/%3E %3C/g%3E %3C/svg%3E";

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
}

#[near_bindgen]
impl Contract {
    /// Initializes the contract owned by `owner_id` with
    /// default metadata (for example purposes only).
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "Haiku World".to_string(),
                symbol: "HAIKU".to_string(),
                icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()),
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        )
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        require!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
        }
    }

    #[payable]
    pub fn haiku_mint(
        &mut self,
        haiku: String,
        media: String,
        title: String
    ) -> Token {
        assert!(env::attached_deposit() >= 10u128.pow(24), "Must attach at least 1 NEAR");
        let total_supply: u128 = self.tokens.nft_total_supply().into();
        let token_id = (total_supply+1u128).to_string();
        let metadata = TokenMetadata{
            title:Some(title), 
            description: Some(haiku), 
            media: Some(media), 
            media_hash: None, 
            copies: Some(1u64), 
            issued_at: None, 
            expires_at: None, 
            starts_at: None, 
            updated_at: None, 
            extra: Some("W10=".into()), 
            reference: None, 
            reference_hash: None 
        };
        let token = self.tokens.internal_mint_with_refund(
            token_id,
            env::predecessor_account_id(),
            Some(metadata),
            None,
        );
        NftMint { owner_id: &token.owner_id, token_ids: &[&token.token_id], memo: None }.emit();
        token
    }

    #[payable]
    pub fn empty_haiku_mint(
        &mut self,
    ) -> Token {
        assert!(env::attached_deposit() >= 2*10u128.pow(24), "Must attach at least 2 NEAR");
        let total_supply: u128 = self.tokens.nft_total_supply().into();
        let token_id = (total_supply+1u128).to_string();
        let metadata = TokenMetadata{
            title:Some("Empty".to_string()), 
            description: None, 
            media: Some("https://ipfs.io/ipfs/bafybeicq7by6aylj4bt7uz76c3ocqje5wiwgwnp7pxx6vui5ux2rwx3snq".to_string()), 
            media_hash: None, 
            copies: Some(1u64), 
            issued_at: None, 
            expires_at: None, 
            starts_at: None, 
            updated_at: None, 
            extra: Some("W10=".into()), 
            reference: None, 
            reference_hash: None 
        };
        let token = self.tokens.internal_mint_with_refund(
            token_id,
            env::predecessor_account_id(),
            Some(metadata),
            None,
        );
        NftMint { owner_id: &token.owner_id, token_ids: &[&token.token_id], memo: None }.emit();
        token
    }

    #[private]
    pub fn update_haiku(
        &mut self,
        token_id: String,
        haiku: String,
        media: String,
        title: String
    ) -> Token {
        let mut nft = self.tokens.nft_token(token_id.clone()).expect("No NFT with the given id found.");
        let mut metadata = nft.metadata.unwrap();
        metadata.description = Some(haiku);
        metadata.title = Some(title);
        metadata.media = Some(media);
        self.tokens.token_metadata_by_id.as_mut().unwrap().insert(&token_id, &metadata);
        nft.metadata = Some(metadata);
        nft
    }

    #[private]
    pub fn clear(
        &mut self
    ) {
        for kv in self.tokens.owner_by_id.iter(){
            self.tokens.token_metadata_by_id.as_mut().unwrap().remove(&kv.0);
            self.tokens.approvals_by_id.as_mut().unwrap().remove(&kv.0);
        }
        self.tokens.owner_by_id.clear();
    }
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}