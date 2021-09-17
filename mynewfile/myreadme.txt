FabCar Network Extension with 3 Organizations(Fabric version- 1.4.0)
Subhra Sankha Bose
Subhra Sankha Bose

Sep 9, 2019·15 min read





Here, we will be extending the default fabcar project of fabric-samples to a project (FabCar-Extension) that will have 3 orgs. Below is the network components that we will have,
Network Components:
3 organization (1 peer/org)
3 Certificate Authority (1 CA/org)
3 CouchDB database(1 CouchDB/peer)
1 Orderer (“Solo” ordering service)
I have tried to extend the network with minimum code addition to the default FabCar sample project so that one can spin-up the network easily and after that the network can be upgraded more by themselves.
# Prerequisites…
Before proceeding, please go through the official docs once for the default FabCar project so that going forward we can invest our time more to the practical approach to bring up the network rather than the theoretical concepts. Sharing the links of the official docs below,
Understanding the Fabcar Network — hyperledger-fabricdocs master documentation
Fabcar was designed to leverage a network stripped down to only the components necessary to run an application. And…
hyperledger-fabric.readthedocs.io

Writing Your First Application — hyperledger-fabricdocs master documentation
Note If you’re not yet familiar with the fundamental architecture of a Fabric network, you may want to visit the Key…
hyperledger-fabric.readthedocs.io

2. Now that you have gone through the above links, it’s time to setting up the development environment( if you haven’t already done so). Please follow the below link to install all prerequisites on the platform(s) on which you’ll be developing blockchain applications and/or operating Hyperledger Fabric.
Prerequisites — hyperledger-fabricdocs master documentation
Before we begin, if you haven’t already done so, you may wish to check that you have all the prerequisites below…
hyperledger-fabric.readthedocs.io

3. Now, installing samples, binaries and Docker images of Fabric version 1.4.0. You can download fabric samples directly on your environment by running the below command via terminal,
curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s 1.4.0
4. Last but not least, download/clone this FabCar-Extension project from this GitHub link.
Please use this FabCar-Extension project if you wish to copy-paste the code because the sample code that is given here is only a snippet of added codes.
If you want to run the cloned FabCar-Extension project directly, please jump to the # Running it now section of this article.
Now, we are done with those prerequisites. Let’s see the code.
# Getting into the Code…
// Part 1: Network Setup
As you know,the FabCar sample project uses the basic-network project, here also we will use the basic-network project files.Go inside the basic-network
crypto-config.yaml file
This file is inside the basic-network folder. Below is the code snippet,
- Name: Org2
Domain: org2.example.com
Template:
Count: 1
Users:
Count: 1
- Name: Org3
Domain: org3.example.com
Template:
Count: 1
Users:
Count: 1
The code is pretty straight forward, just Org definition added for Org2, Org3.
we will have only 1 peer for every org(org2 and org3). So, Count: 1
2. configtx.yaml file
This file is in the basic-network folder. Below is the code snippet,
Organizations: section
- &Org2
Name: Org2MSP
ID: Org2MSP
MSPDir: crypto-config/peerOrganizations/org2.example.com/msp
AnchorPeers:
- Host: peer0.org2.example.com
Port: 7051
- &Org3
Name: Org3MSP
ID: Org3MSP
MSPDir: crypto-config/peerOrganizations/org3.example.com/msp
AnchorPeers:
- Host: peer0.org3.example.com
Port: 7051
Added Org2 and Org3 on Organizations: section.
Profiles: section
Profiles:
ThreeOrgOrdererGenesis:
Orderer:
<<: *OrdererDefaults
Organizations:
- *OrdererOrg
Consortiums:
SampleConsortium:
Organizations:
- *Org1
- *Org2
- *Org3
ThreeOrgChannel:
Consortium: SampleConsortium
Application:
<<: *ApplicationDefaults
Organizations:
- *Org1
- *Org2
- *Org3
The default Profiles: section of fabcar sample project is different, we need to modify it. Here, our profiles are ThreeOrgOrdererGenesis and ThreeOrgChannel where we are having 3 organizations (eg. Org1, Org2, Org3). Replace the default profiles: section by copying it from the FabCar-Extension project.
3. generate.sh file
This script file is in the basic-network folder. Below is the code snippet,
# generate crypto material
cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
echo "Failed to generate crypto material..."
exit 1
fi
mkdir config
# generate genesis block for orderer
configtxgen -profile ThreeOrgOrdererGenesis -channelID fabcar-sys-channel -outputBlock ./config/genesis.block
if [ "$?" -ne 0 ]; then
echo "Failed to generate orderer genesis block..."
exit 1
fi
# generate channel configuration transaction
configtxgen -profile ThreeOrgChannel -outputCreateChannelTx ./config/channel.tx -channelID $CHANNEL_NAME
if [ "$?" -ne 0 ]; then
echo "Failed to generate channel configuration transaction..."
exit 1
fi
configtxgen -profile ThreeOrgChannel -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
if [ "$?" -ne 0 ]; then
echo "Failed to generate anchor peer update for Org1MSP..."
exit 1
fi
configtxgen -profile ThreeOrgChannel -outputAnchorPeersUpdate ./config/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
if [ "$?" -ne 0 ]; then
echo "Failed to generate anchor peer update for Org2MSP..."
exit 1
fi
configtxgen -profile ThreeOrgChannel -outputAnchorPeersUpdate ./config/Org3MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org3MSP
if [ "$?" -ne 0 ]; then
echo "Failed to generate anchor peer update for Org3MSP..."
exit 1
fi
Here, we are creating crypto-material channel-artifacts. crypto-material is saved in a crypto-config folder and channel-artifacts are saved in a config folder. This two folders will be generated at basic-network directory.
4. docker-compose.yml file
The file is in the basic-network folder.
This file consists of a total of 11 services defined, every service is a container.
Three CA containers (eg. ca0, ca1,ca2)
One orderer ( orderer.example.com)
Three peer containers -
peer0.org1.example.com,peer0.org2.example.com,peer0.org1.example.com)
4. Three couch-DB containers (eg. couchdb0, couchdb1,couchdb2 )
5. One Cli container (eg. cli )
CA service:
services:
ca0:
image: hyperledger/fabric-ca
environment:
- FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server
- FABRIC_CA_SERVER_CA_NAME=ca-org1
- FABRIC_CA_SERVER_CA_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.org1.example.com-cert.pem
- FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server-config/4b61f0a89926b0f4a9d8067d0b4fbb2192c492d78d87110e74acd01a6fc914df_sk
- FABRIC_CA_SERVER_PORT=7054
ports:
- "7054:7054"
command: sh -c 'fabric-ca-server start --ca.certfile /etc/hyperledger/fabric-ca-server-config/ca.org1.example.com-cert.pem --ca.keyfile /etc/hyperledger/fabric-ca-server-config/4b61f0a89926b0f4a9d8067d0b4fbb2192c492d78d87110e74acd01a6fc914df_sk -b admin:adminpw -d'
volumes:
- ./crypto-config/peerOrganizations/org1.example.com/ca/:/etc/hyperledger/fabric-ca-server-config
container_name: ca_peerOrg1
networks:
- basic
4b61f0a89926b0f4a9d8067d0b4fbb2192c492d78d87110e74acd01a6fc914df_sk is the private key of the CA server. This hexadecimal number would be different on your case, once you generate the crypto-material this would be found under crypto-config/peerOrganizations/org1.example.com/ca folder, you have to go to the path and copy the _sk key and replace those above bolded sections in CA services definition (2 places/ca)with your key.
Replace the keys for every CA (eg. ca0, ca1, ca2) by following the below path,
for ca1→ crypto-config/peerOrganizations/org2.example.com/ca
for ca2 → crypto-config/peerOrganizations/org3.example.com/ca
I am not describing the other services that I have added, as not many changes done on those services, please go through the docker-compose.yml file from the downloaded FabCar-Extension project once, I feel you will understand it quite easily.
5. start.sh file
The file is in the basic-network folder. Below is a code snippet,
# Bring-up the containers 
docker-compose -f docker-compose.yml up -d ca0 ca1 ca2 orderer.example.com peer0.org1.example.com peer0.org2.example.com peer0.org3.example.com couchdb0 couchdb1 couchdb2
# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
sleep ${FABRIC_START_TIMEOUT}
# Create the channel
docker exec -e “CORE_PEER_LOCALMSPID=Org1MSP” -e “CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp” peer0.org1.example.com peer channel create -o orderer.example.com:7050 -c mychannel -f /etc/hyperledger/configtx/channel.tx
# Join peer0.org1.example.com to the channel.
docker exec -e “CORE_PEER_LOCALMSPID=Org1MSP” -e “CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp” peer0.org1.example.com peer channel join -b mychannel.block
# Fetch the mychannel.block file from peer1.org1.example.com docker container
docker exec -e “CORE_PEER_LOCALMSPID=Org2MSP” -e “CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.example.com/msp” peer0.org2.example.com peer channel fetch 0 mychannel.block -o orderer.example.com:7050 -c mychannel
# Join peer0.org2.example.com to the channel
docker exec -e “CORE_PEER_LOCALMSPID=Org2MSP” -e “CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.example.com/msp” peer0.org2.example.com peer channel join -b mychannel.block
# Fetch the mychannel.block file from peer1.org1.example.com docker container
docker exec -e “CORE_PEER_LOCALMSPID=Org3MSP” -e “CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.example.com/msp” peer0.org3.example.com peer channel fetch 0 mychannel.block -o orderer.example.com:7050 -c mychannel
# Join peer0.org2.example.com to the channel
docker exec -e “CORE_PEER_LOCALMSPID=Org3MSP” -e “CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.example.com/msp” peer0.org3.example.com peer channel join -b mychannel.block
Code added in this file are -
First bring-up the docker containers, total 10 containers.
Three CA containers, orderer container, three peer containers, three CouchDB containers.
2. Fetching the mychannel.block file from peer0.org1 container to the peer0.org2 and peer0.org3 container.
3. Joining the peer0.org2 and peer0.org3 to the channel
We can’t directly join the channel for peer0.org2 and peer0.org3, if you do so it will give an error like below,
Error: genesis block file not found open mychannel.block: no such file or directory
So, we need to first fetch the mychannel.block file then join the channel.
These are the modifications done on this file.
6. startFabric.sh file
The script file can be found in the fabcar folder. Get out of the basic-network folder and go inside fabcar folder, Below is a code snippet,
# launch network; create channel and join peer to channel
cd ../basic-network
./start.sh
# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars
docker-compose -f ./docker-compose.yml up -d cli
# install the chaincode on peer0 of org1
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "$CC_RUNTIME_LANGUAGE"
# install the chaincode on peer0 of org2
docker exec -e "CORE_PEER_ADDRESS=peer0.org2.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "$CC_RUNTIME_LANGUAGE"
# install the chaincode on peer0 of org3
docker exec -e "CORE_PEER_ADDRESS=peer0.org3.example.com:7051" -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "$CC_RUNTIME_LANGUAGE"
#instantiate the chaincode
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -l "$CC_RUNTIME_LANGUAGE" -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 10
# call the chaincode invoke function on peer0 of org1
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n fabcar -c '{"function":"initLedger","Args":[]}'
The code additions made in this file are for to install chaincode on peer0 of org2 and peer0 of org3. Look at the code for installing chaincode on peer0 of org2 and peer0 of org3 and compare with the code of installing chaincode on peer0 of org1. yes, there is an additional environment variable CORE_PEER_ADDRESS, we need to add this because the default value of this environment variable is peer0.org1.example.com:7051.
Apart from this remaining code of startFabric.sh file is same as the default fabcar project startFabric.sh file.
7. connection-org1.json file
This file is in the basic-network folder. This file is for connection profiling. To know more about how to set-up, refer this.
{
"name": "basic-network",
"version": "1.0.0",
"client": {
"organization": "Org1",
"connection": {
"timeout": {
"peer": {
"endorser": "300"
},
"orderer": "300"
}
}
},
"channels": {
"mychannel": {
"orderers": [
"orderer.example.com"
],
"peers": {
"peer0.org1.example.com": {},
"peer0.org2.example.com": {},
"peer0.org3.example.com": {}
}
}
},
"organizations": {
"Org1": {
"mspid": "Org1MSP",
"peers": [
"peer0.org1.example.com"
],
"certificateAuthorities": [
"ca.org1.example.com"
]
},
"Org2": {
"mspid": "Org2MSP",
"peers": [
"peer0.org2.example.com"
],
"certificateAuthorities": [
"ca.org2.example.com"
]
},
"Org3": {
"mspid": "Org3MSP",
"peers": [
"peer0.org3.example.com"
],
"certificateAuthorities": [
"ca.org3.example.com"
]
}
},
"orderers": {
"orderer.example.com": {
"url": "grpc://localhost:7050"
}
},
"peers": {
"peer0.org1.example.com": {
"url": "grpc://localhost:7051"
},
"peer0.org2.example.com": {
"url": "grpc://localhost:8051"
},
"peer0.org3.example.com": {
"url": "grpc://localhost:9051"
}
},
"certificateAuthorities": {
"ca.org1.example.com": {
"url": "http://localhost:7054",
"caName": "ca-org1"
},
"ca.org2.example.com": {
"url": "http://localhost:8054",
"caName": "ca-org2"
},
"ca.org3.example.com": {
"url": "http://localhost:9054",
"caName": "ca-org3"
}
}
}
The connection profile definition for the other organizations(eg. org2 and org3), you just need to change the organization attribute(Org2 or Org3),thats all.
Please refer the connection-org2.json and connection-org3.json in the FabCar-Extension project to make the connection profile for Org2 and Org3.
// Part 2: Client Application
We will be using javaScript language for interacting with the network. So, all our files are inside the fabcar →javascript folder.
enrollAdmin-org1.js file
As the filename says, this file is to enroll admin for org1. Below is the code,
'use strict';
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection-org1.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
async function main() {
try {
// Create a new CA client for interacting with the CA.
const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
const ca = new FabricCAServices(caURL);
// Create a new file system based wallet for managing identities.
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);
console.log(`Wallet path: ${walletPath}`);
// Check to see if we've already enrolled the admin user.
const adminExists = await wallet.exists('admin-org1');
if (adminExists) {
console.log('An identity for the admin user "admin-org1" already exists in the wallet');
return;
}
// Enroll the admin user, and import the new identity into the wallet.
const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
wallet.import('admin-org1', identity);
console.log('Successfully enrolled admin user "admin-org1" and imported it into the wallet');
} catch (error) {
console.error(`Failed to enroll admin user "admin-org1": ${error}`);
process.exit(1);
}
}
main();
Here, 1. we are using the connection-org1.json file to connect with the blockchain network.
2. Use the Org1 Certificate Authority (ca.org1.example.com) to enroll the admin user (admin-org1) for org1.
3. Save that admin identity in the admin-org1 subfolder in the wallet folder.
Like enrollAdmin-org1.js, enrollAdmin-org2.js and enrollAdmin-org3.js file is for enrolling admin user for org2 and org3 respectively. The files is self explainatory,please look into the files in the FabCar-Extension project.
2. registerUser-org1.js file
As the filename says, this file is to register a non-admin user for org1. Below is the code,
'use strict';
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection-org1.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
async function main() {
try {
// Create a new file system based wallet for managing identities.
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);
console.log(`Wallet path: ${walletPath}`);
// Check to see if we've already enrolled the user.
const userExists = await wallet.exists('user1-org1');
if (userExists) {
console.log('An identity for the user "user1-org1" already exists in the wallet');
return;
}
// Check to see if we've already enrolled the admin user.
const adminExists = await wallet.exists('admin-org1');
if (!adminExists) {
console.log('An identity for the admin user "admin-org1" does not exist in the wallet');
console.log('Run the enrollAdmin-org1.js application before retrying');
return;
}
// Create a new gateway for connecting to our peer node.
const gateway = new Gateway();
await gateway.connect(ccp, { wallet, identity: 'admin-org1', discovery: { enabled: false } });
// Get the CA client object from the gateway for interacting with the CA.
const ca = gateway.getClient().getCertificateAuthority();
const adminIdentity = gateway.getCurrentIdentity();
// Register the user, enroll the user, and import the new identity into the wallet.
const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: 'user1', role: 'client' }, adminIdentity);
const enrollment = await ca.enroll({ enrollmentID: 'user1', enrollmentSecret: secret });
const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
wallet.import('user1-org1', userIdentity);
console.log('Successfully registered and enrolled admin user "user1-org1" and imported it into the wallet');
} catch (error) {
console.error(`Failed to register user "user1-org1": ${error}`);
process.exit(1);
}
}
main();
Here, 1. we are using the connection-org1.json file to connect with the blockchain network.
2. We will check if the user (user1-org1) is present in the wallet folder, if yes then we won’t proceed further. If no, then go to step 3.
3. Check to see if we’ve already enrolled the admin user(admin-org1), if no
then we won’t proceed further. If yes, then go to step 4.
4. We create the new user(user1-org1) using Org1 CA and save the identity in the wallet folder.
Like registerUser-org1.js, registerUser-org2.js file is for registering a non-admin user for org2. The files is self explainatory,please look into the files in the FabCar-Extension project. But the registerUser-org3.js need some code addition into it to work, We will disucess the registerUser-org3.js file next.
3. registerUser-org3.js file
Please look at the registerUser-org3.js once, you will find below two lines added more as compared to registerUser-or1.js or registerUser-or2.js file.
const affiliationService = ca.newAffiliationService();
await affiliationService.create({name: 'org3.department1', force: true}, adminIdentity);
By-default fabric-ca only has the below affiliations, for org1 and org2 only
affiliations:
   org1:
      - department1
      - department2
   org2:
      - department1
This default affiliation is specified in fabric-ca-server-config.yaml file. You can see this file by,
Going into any running CA container, by running below command
docker exec -it ca_name /bin/bash
2. Now, go to the below path
root@d02968e2fe28:/etc/hyperledger/fabric-ca-server#
So, we need to add affiliation for org3 by adding above 2 lines of code.
The query-org1.js, query-org2.js,query-org3.js file calls function queryAllCars() that query all the cars from org1’s peer node,org2’s peer node, org3’s peer node respectively.
The invoke-org1.js, invoke-org2.js, file calls function createCar() that creates a car object and saves it in DB.invoke-org3.js file calls funtion changeCarOwner().
Please go through the files from the FabCar-Extension project, the files are all simple and straightforward. I feel you will understand those files quite easily.
# Running it now…
If you want to run the cloned FabCar-Extension project directly, please follow the below steps:
1. change the file perrmision of start.sh. run chmod 777 start.sh command inside the basic-network folder.
2. change the file perrmision of startFabric.sh. run chmod 777 startFabric.sh command inside the fabcar folder.
3. Now, skip the step 1 Generating the crypto material and channel artifacts and step 2.Coping the crypto material because the crypto-config and config folders are already present in basic-network folder of FabCar-Extension project.Follow from step 3.Launch the network
Congratulations, if you have come along up to this, you are done with the code. Now, we just need to follow the below steps to spin-up the fabric network and interact with it.
Generating the crypto material and channel artifacts
Go to the basic-network folder and run the generate.sh file
./generate.sh
It will generate crypto-config and config folder in basic-network folder.
2. Coping the crypto material
Copy the private key of the CA server from the below paths respectively and paste it in the docker-compose file. Do it for all three CAs.
For ca0 →crypto-config/peerOrganizations/org1.example.com/ca
For ca1 → crypto-config/peerOrganizations/org2.example.com/ca
For ca2 → crypto-config/peerOrganizations/org3.example.com/ca
Check, have you replaced all 6 places(2 places/ca) with your keys?
3. Launch the network
Go to the fabcar folder and run below command to spin-up the blockchain network
./startFabric.sh javascript
This command will spin up a blockchain network comprising 3 peers, 1 orderer, 3 certificate authorities and more. It will also install and instantiate a JavaScript version of the FabCar smart contract which will be used by our application to access the ledger.
Run docker ps command now, you will see total 12 containers running,

4. Install the application
Go to the javascript folder and run the following command to install the Fabric dependencies for the applications
npm install
After running this you should see a node_modules folder generated.
5. Enrolling the admin user
Run below command to enroll admin user for org1, admin-org1:
node enrollAdmin-org1.js
Run below command to enroll admin user for org2, admin-org2:
node enrollAdmin-org2.js
Run below command to enroll admin user for org3, admin-org3 :
node enrollAdmin-org3.js
After running this you will see a wallet folder generated. Go inside this folder and there will be admin-org1, admin-org2, admin-org3 named folders generated.
now, go back to the javascript folder again.
6.Register and enroll the user
Run below command to register a user for org1, user1-org1 :
node registerUser-org1.js
Run below command to register a user for org2, user1-org2 :
node registerUser-org2.js
Run below command to register a user for org3, user1-org3 :
node registerUser-org3.js
After running this, go inside the wallet folder and there will be admin-org1, admin-org2, admin-org3 generated. Now, go back to the javascript folder again.
Below is a screenshot of the console after enrolling admin users and registering non-admin users,

7. Invoke a transaction
Run below command to invoke a transaction through org1 peer:
node invoke-org1.js
A sample output screenshot,

Run below command to invoke a transaction through org2 peer:
node invoke-org2.js
A sample output screenshot,

Run below command to invoke a transaction through org3 peer:
node invoke-org3.js
A sample output screenshot,

8. Querying the ledger
Run below command to query the ledger through org1 peer:
node query-org1.js
A sample output screenshot,

Run below command to query the ledger through org2 peer:
node query-org2.js
A sample output screenshot,

Run below command to query the ledger through org3 peer:
node query-org3.js
A sample output screenshot,

After doing all the above steps, check all running container by running docker ps command, you will see total 14 containers running, See below screenshot,

That’s it!! We have made-up a simple Fabric blockchain network with 3 nodes by extending the default FabCar sample project.
Hope you have enjoyed reading, if so please give a clap and for any suggestion or queries regarding this article please reach me on https://www.linkedin.com/in/subhrasankhabose069951b5/
Subhra Sankha Bose
Follow

19


Related


Behind-the-Screens at the MFA Spring Intensive


Meal prep miracle: Los Gatos-based Locale reimagines food delivery


Menlo Park’s Bistro Vida celebrated as small business of the year


How SF’s Great Highway Closure Converted Me from Doomscroller to Local Advocate


Link
-----------------
https://medium.com/@subhrasankhabose/fabcar-network-extension-with-3-organizations-fabric-version-1-4-0-6208909c5c67
https://github.com/SUBHRA7/FabCar-Extension
