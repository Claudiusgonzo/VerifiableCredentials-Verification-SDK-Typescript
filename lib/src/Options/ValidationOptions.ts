/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { FetchKeyAndValidateSignatureOnIdToken, IValidationOptions, CheckTimeValidityOnToken, ResolveDidAndGetKeys, GetTokenObject, ValidateDidSignature, CheckScopeValidityOnToken, ValidateSignatureOnToken, GetTokensFromSiop, GetClaimBag } from './IValidationOptions';
import { ValidationHelpers } from '../InputValidation/ValidationHelpers';
import { IValidatorOptions } from '../index';
/**
 *Interface to model validation options
 */
export default class ValidationOptions implements IValidationOptions {

/**
 * Create new instance of <see @class ValidationOptions>
 * @param validatorOptions The validator options
 * @param inputDescription Describe the type of token for error messages
 */
constructor (public validatorOptions: IValidatorOptions, public inputDescription: string) {
  this.validationHelpers = new ValidationHelpers(validatorOptions, this, inputDescription);
  this.getTokenObjectDelegate = this.validationHelpers.getTokenObject;
  this.resolveDidAndGetKeysDelegate = this.validationHelpers.resolveDidAndGetKeys;
  this.validateDidSignatureDelegate = this.validationHelpers.validateDidSignature;
  this.checkTimeValidityOnTokenDelegate = this.validationHelpers.checkTimeValidityOnToken;
  this.checkScopeValidityOnTokenDelegate = this.validationHelpers.checkScopeValidityOnToken;
  this.fetchKeyAndValidateSignatureOnIdTokenDelegate = this.validationHelpers.fetchKeyAndValidateSignatureOnIdToken;
  this.validateSignatureOnTokenDelegate = this.validationHelpers.validateSignatureOnToken;
  this.getTokensFromSiopDelegate = this.validationHelpers.getTokensFromSiop;
  this.getClaimBagDelegate = this.validationHelpers.getClaimBag;
}

/**
 * Gets the helpers
 */
public validationHelpers: ValidationHelpers;

/**
 * Get the token object from the request body
 */
public getTokenObjectDelegate: GetTokenObject;

/**
  * Resolve the DID and get public keys
  */
 public resolveDidAndGetKeysDelegate: ResolveDidAndGetKeys; 

 /**
  * Validate the DID signatyre
  */
 public validateDidSignatureDelegate: ValidateDidSignature;

  /**
   * Check the time validity of the token
   */
  public checkTimeValidityOnTokenDelegate: CheckTimeValidityOnToken;

  /**
   * Check the scope validity of the token
   */
  public checkScopeValidityOnTokenDelegate: CheckScopeValidityOnToken;

  /**
   * Delegate for getting a key and validate the signature on the token
   */
  public fetchKeyAndValidateSignatureOnIdTokenDelegate: FetchKeyAndValidateSignatureOnIdToken;
  
  /**
   * Signature validation
   */
  public validateSignatureOnTokenDelegate: ValidateSignatureOnToken;
  
  /**
   * Retrieve tokens from SIOP
   */
  public getTokensFromSiopDelegate: GetTokensFromSiop;

  /**
   * Get the claim bag based in tokens from the request
   */
  public getClaimBagDelegate: GetClaimBag; 
}
