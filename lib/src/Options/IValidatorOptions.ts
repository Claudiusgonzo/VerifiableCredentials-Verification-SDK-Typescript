/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDidResolver } from '../index';
import { IKeyStore, IPayloadProtectionOptions, IPayloadProtection, CryptoFactory } from '@microsoft/crypto-sdk';


 /**
 * Interface to model the crypto options
 */
export interface ICryptoOptions {
  /**
   * Get the key store
   */
  keyStore: IKeyStore;

  /**
   * Get the subtle crypto object
   */
  cryptoFactory: CryptoFactory;

  /** 
   * The payload protection protocol
  */
  payloadProtectionProtocol: IPayloadProtection;

  /**
   * Get the default crypto options
   */
  cryptoOptions: IPayloadProtectionOptions;
}

 /**
 * Interface to model the validator options
 */
export default interface IValidatorOptions {

    /**
     * The DID resolver
     */
    resolver: IDidResolver,

    /**
     * The http client to use
     */
    fetch: any,

    /**
     * Get the crypto options
     */
    cryptoOptions: ICryptoOptions
}
