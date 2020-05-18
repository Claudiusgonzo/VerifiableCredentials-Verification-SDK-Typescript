import { Crypto } from '../index';
import { PublicKey } from '@microsoft/crypto-keys';
import base64url from 'base64url';
import OperationType from '@decentralized-identity/sidetree/dist/lib/core/enums/OperationType';
import CreateOperation from '@decentralized-identity/sidetree/dist/lib/core/versions/latest/CreateOperation';
import Multihash from '@decentralized-identity/sidetree/dist/lib/core/versions/latest/Multihash';


/**
 * Helper class to work with long form DID's
 */
export default class LongFormDid {
  constructor(private crypto: Crypto) { }

  /**
   * Create key and return longform
   * @param keyReference Reference to the key
   */
  public async create(keyReference: string): Promise<any> {
    // See https://github.com/diafygi/webcrypto-examples for examples how to use the W3C web Crypto stamdard
    // Generate the signing key
    let key: any = await this.crypto.builder.subtle.generateKey(
      <EcKeyGenParams>{
        name: 'ECDSA',
        namedCurve: 'secp256k1'
      },
      true,
      ['sign', 'verify']
    );
    const signingPrivate: any = await this.crypto.builder.subtle.exportKey('jwk', key.privateKey);
    const signingPublic = await this.crypto.builder.subtle.exportKey('jwk', key.publicKey);
    delete (<any>signingPublic).key_ops;
    delete (<any>signingPublic).ext;

    // Generate recovery key
    key = await this.crypto.builder.subtle.generateKey(
      <EcKeyGenParams>{
        name: 'ECDSA',
        namedCurve: 'secp256k1'
      },
      true,
      ['sign', 'verify']
    );
    const recoveryPrivate: any = await this.crypto.builder.subtle.exportKey('jwk', key.privateKey);
    const recoveryPublic = await this.crypto.builder.subtle.exportKey('jwk', key.publicKey);
    delete (<any>recoveryPublic).key_ops;
    delete (<any>recoveryPublic).ext;

    // Store key
    await this.crypto.builder.keyStore.save(keyReference, signingPrivate);
    await this.crypto.builder.keyStore.save('recovery', recoveryPrivate);

    // Create long-form did
    return this.generateCreateOperation(recoveryPublic, signingPublic);
  };


  /**
   * Generates an create operation.
   */
  public async generateCreateOperation(recoveryPublicKey: any, signingPublicKey: any) {
    // Generate the next update and recover operation commitment hash reveal value pair.
    const [nextRecoveryRevealValueEncodedString, nextRecoveryCommitmentHash] = await this.generateCommitRevealPair();
    const [nextUpdateRevealValueEncodedString, nextUpdateCommitmentHash] = await this.generateCommitRevealPair();

    const operationRequest = this.generateCreateOperationRequest(
      recoveryPublicKey,
      signingPublicKey,
      nextRecoveryCommitmentHash,
      nextUpdateCommitmentHash
    );
    const operationBuffer = Buffer.from(JSON.stringify(operationRequest));

    const createOperation = await CreateOperation.parse(operationBuffer);

    return {
      createOperation,
      operationRequest,
      recoveryPublicKey,
      signingPublicKey,
      nextRecoveryRevealValueEncodedString,
      nextUpdateRevealValueEncodedString
    };
  }

  /**
   * Generates a reveal value and commitment hash as encoded strings for use in opertaions.
   * @returns [revealValueEncodedString, commitmentValueHashEncodedString]
   */
  public async generateCommitRevealPair(): Promise<[string, string]> {
    const secretKey = await this.crypto.builder.subtle.generateKey(<AesKeyGenParams>{ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const randomBytes =  await this.crypto.builder.subtle.exportKey('jwk', <any>secretKey);
    const revealValueEncodedString = (<any>randomBytes).k;
    const commitmentHash = Multihash.hash(base64url.toBuffer(revealValueEncodedString), 18); //sha-256
    const commitmentHashEncodedString = base64url.encode(commitmentHash);
    return [revealValueEncodedString, commitmentHashEncodedString];
  }

  /**
 * Generates a create operation request.
 * @param nextRecoveryCommitment The encoded commitment hash for the next recovery.
 * @param nextUpdateCommitment The encoded commitment hash for the next update.
 */
  public generateCreateOperationRequest(
    recoveryPublicKey: PublicKey,
    signingPublicKey: PublicKey,
    nextRecoveryCommitment: string,
    nextUpdateCommitment: string) {
    const document = {
      publicKeys: [signingPublicKey]
    };

    const patches = [{
      action: 'replace',
      document
    }];

    const delta = {
      update_commitment: nextUpdateCommitment,
      patches
    };

    const deltaBuffer = Buffer.from(JSON.stringify(delta));
    const deltaHash = base64url.encode(Multihash.hash(deltaBuffer));

    const suffixData = {
      delta_hash: deltaHash,
      recovery_key: recoveryPublicKey,
      recovery_commitment: nextRecoveryCommitment
    };

    const suffixDataEncodedString = base64url.encode(JSON.stringify(suffixData));
    const deltaEncodedString = base64url.encode(deltaBuffer);
    const operation = {
      type: OperationType.Create,
      suffix_data: suffixDataEncodedString,
      delta: deltaEncodedString
    };

    return operation;
  }
}