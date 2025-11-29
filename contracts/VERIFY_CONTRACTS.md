# Contract Verification Guide for Base Sepolia

## ✅ Deployed Contracts

### ResultsConsumer
- **Address**: `0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592`
- **Explorer**: https://sepolia.basescan.org/address/0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592
- **Constructor Args**:
  - Router: `0xf9B8fc078197181C841c296C876945aaa425B278`
  - DON ID: `0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000`

### PredictionContract
- **Address**: `0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB`
- **Explorer**: https://sepolia.basescan.org/address/0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB
- **Constructor Args**:
  - ResultsConsumer: `0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592`

## 🔍 How to Verify Contracts

### Option 1: Using Hardhat (Requires API Key)

1. **Get BaseScan API Key**:
   - Visit: https://basescan.org/myapikey
   - Create account and get API key

2. **Add to .env**:
   ```env
   BASESCAN_API_KEY=your_api_key_here
   ```

3. **Verify ResultsConsumer**:
   ```bash
   npx hardhat verify --network base-sepolia \
     0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592 \
     0xf9B8fc078197181C841c296C876945aaa425B278 \
     0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000
   ```

4. **Verify PredictionContract**:
   ```bash
   npx hardhat verify --network base-sepolia \
     0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB \
     0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592
   ```

### Option 2: Manual Verification on BaseScan

1. **Go to Contract Page**:
   - ResultsConsumer: https://sepolia.basescan.org/address/0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592#code
   - PredictionContract: https://sepolia.basescan.org/address/0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB#code

2. **Click "Contract" Tab** → **"Verify and Publish"**

3. **Select Verification Method**:
   - Choose "Via Standard JSON Input" (recommended)

4. **Upload Files**:
   - Upload the contract source code
   - Upload the compiler input JSON (from `artifacts/build-info/`)

5. **Enter Constructor Arguments**:
   - For ResultsConsumer: `["0xf9B8fc078197181C841c296C876945aaa425B278","0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000"]`
   - For PredictionContract: `["0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592"]`

6. **Submit and Wait** for verification

## 📝 Contract Details

### ResultsConsumer
- **Solidity Version**: 0.8.19
- **Compiler**: Paris EVM
- **Optimizer**: Enabled (200 runs)
- **Libraries**: 
  - `@chainlink/contracts` v1.5.0
  - FunctionsClient, ConfirmedOwner

### PredictionContract
- **Solidity Version**: 0.8.20
- **Compiler**: Paris EVM
- **Optimizer**: Enabled (200 runs)
- **Dependencies**: ResultsConsumer

## ✅ Verification Status

- [x] ResultsConsumer verified ✅
  - Verified at: https://sepolia.basescan.org/address/0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592#code
- [x] PredictionContract verified ✅
  - Verified at: https://sepolia.basescan.org/address/0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB#code

---

**Note**: Verification is optional but recommended for transparency and easier interaction with contracts.

