import { DeployRequest, RelayRequest } from './RelayRequest';
import {
    EIP712Domain,
    EIP712TypedData,
    EIP712TypeProperty,
    EIP712Types,
    TypedDataUtils
} from 'eth-sig-util';

import { bufferToHex } from 'ethereumjs-util';
import { PrefixedHexString } from 'ethereumjs-tx';

//@ts-ignore
import sourceMapSupport from 'source-map-support';
//@ts-ignore
sourceMapSupport.install({ errorFormatterForce: true });

export const EIP712DomainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
];

const RelayDataType = [
    { name: 'gasPrice', type: 'uint256' },
    { name: 'feesReceiver', type: 'address' },
    { name: 'callForwarder', type: 'address' },
    { name: 'callVerifier', type: 'address' }
];

export const ForwardRequestType = [
    { name: 'relayHub', type: 'address' },
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'tokenContract', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'tokenAmount', type: 'uint256' },
    { name: 'tokenGas', type: 'uint256' },
    { name: 'validUntilTime', type: 'uint256' },
    { name: 'data', type: 'bytes' }
];

export const DeployRequestDataType = [
    { name: 'relayHub', type: 'address' },
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'tokenContract', type: 'address' },
    { name: 'recoverer', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'tokenAmount', type: 'uint256' },
    { name: 'tokenGas', type: 'uint256' },
    { name: 'validUntilTime', type: 'uint256' },
    { name: 'index', type: 'uint256' },
    { name: 'data', type: 'bytes' }
];

const RelayRequestType = [
    ...ForwardRequestType,
    { name: 'relayData', type: 'RelayData' }
];

const DeployRequestType = [
    ...DeployRequestDataType,
    { name: 'relayData', type: 'RelayData' }
];

interface Types extends EIP712Types {
    EIP712Domain: EIP712TypeProperty[];
    RelayRequest: EIP712TypeProperty[];
    RelayData: EIP712TypeProperty[];
}

// use these values in registerDomainSeparator
export const DomainSeparatorType = {
    prefix: 'string name,string version',
    name: 'RSK Enveloping Transaction',
    version: '2'
};

export function getDomainSeparator(
    verifyingContract: string,
    chainId: number
): EIP712Domain {
    return {
        name: DomainSeparatorType.name,
        version: DomainSeparatorType.version,
        chainId: chainId,
        verifyingContract: verifyingContract
    };
}

export function getDomainSeparatorHash(
    verifier: string,
    chainId: number
): PrefixedHexString {
    return bufferToHex(
        TypedDataUtils.hashStruct(
            'EIP712Domain',
            getDomainSeparator(verifier, chainId),
            { EIP712Domain: EIP712DomainType }
        )
    );
}

export default class TypedRequestData implements EIP712TypedData {
    readonly types: Types;
    readonly domain: EIP712Domain;
    readonly primaryType: string;
    readonly message: any;

    constructor(chainId: number, verifier: string, relayRequest: RelayRequest) {
        this.types = {
            EIP712Domain: EIP712DomainType,
            RelayRequest: RelayRequestType,
            RelayData: RelayDataType
        };
        this.domain = getDomainSeparator(verifier, chainId);
        this.primaryType = 'RelayRequest';
        // in the signature, all "request" fields are flattened out at the top structure.
        // other params are inside "relayData" sub-type
        this.message = {
            ...relayRequest.request,
            relayData: relayRequest.relayData
        };
    }
}

export class TypedDeployRequestData implements EIP712TypedData {
    readonly types: Types;
    readonly domain: EIP712Domain;
    readonly primaryType: string;
    readonly message: any;

    constructor(
        chainId: number,
        verifier: string,
        relayRequest: DeployRequest
    ) {
        this.types = {
            EIP712Domain: EIP712DomainType,
            RelayRequest: DeployRequestType,
            RelayData: RelayDataType
        };
        this.domain = getDomainSeparator(verifier, chainId);
        this.primaryType = 'RelayRequest';
        // in the signature, all "request" fields are flattened out at the top structure.
        // other params are inside "relayData" sub-type
        this.message = {
            ...relayRequest.request,
            relayData: relayRequest.relayData
        };
    }
}
