@echo off

for %%f in (.\res\*.wasm) do (
    call near call %%~nf.cryptosketches.testnet clear --accountId %%~nf.cryptosketches.testnet
    call near delete %%~nf.cryptosketches.testnet cryptosketches.testnet

    call near create-account %%~nf.cryptosketches.testnet --masterAccount cryptosketches.testnet

    call near deploy %%~nf.cryptosketches.testnet %%f --initFunction new_default_meta --initArgs "{""owner_id"": ""%%~nf.cryptosketches.testnet""}"
)
