/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection-org3.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1-org3');
        if (userExists) {
            console.log('An identity for the user "user1-org3" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin-org3');
        if (!adminExists) {
            console.log('An identity for the admin user "admin-org3" does not exist in the wallet');
            console.log('Run the enrollAdmin-org3.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin-org3', discovery: { enabled: false } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        // You need to add below 2 lines because CA by default having org1, org2 affiliation, not for org3
        const affiliationService = ca.newAffiliationService();
        await affiliationService.create({name: 'org3.department1', force: true}, adminIdentity);
        const secret = await ca.register({ affiliation: 'org3.department1', enrollmentID: 'user1', role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: 'user1', enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org3MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import('user1-org3', userIdentity);
        console.log('Successfully registered and enrolled admin user "user1-org3" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "user1-org3": ${error}`);
        process.exit(1);
    }
}

main();
