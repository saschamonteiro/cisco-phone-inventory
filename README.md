# cisco-phone-inventory

Utility to extract Cisco IPPhones with registration status and optional serial-number (if webservice on the phone is enabled and reachable!) from Cisco UCM.

## Requires
- Node.JS 8.4.0 or higher  
- UCM Services enabled on node1 (pub)
  - Cisco AXL Web Service
  - SOAP - Real-Time Service APIs
- UCM Application user with roles:
  - Standard AXL API access
  - Standard CCM Admin Users
  - Standard SERVICEABILITY

## Install
Clone/download this repo  
run this command in the root directory (where package.json is) to install dependencies  
`npm install`

## Run with serial-number extraction
`UCM_HOST=x.x.x.x UCM_USER=administrator UCM_PASS=password UCM_VERSION=11.5 GET_SERIALS=true node index.js`  

this generates phones.csv  
name,description,loginuser,dirNumber,status,ipaddress,serial,model

## Run without serial-number extraction
`UCM_HOST=x.x.x.x UCM_USER=administrator UCM_PASS=password UCM_VERSION=11.5 node index.js`  

this generates phones.csv  
name,description,loginuser,dirNumber,status,ipaddress

## To save a screenshot of the phones that are reachable
Associate all devices to the UCM_USER and add GET_IMAGES=true to the command:
`UCM_HOST=x.x.x.x UCM_USER=administrator UCM_PASS=password UCM_VERSION=11.5 GET_SERIALS=true GET_IMAGES=true node index.js`

## Note
UCM_VERSION will need to represent a valid AXL Schema version (e.g. 10.0, 10.5, 11.0, 11.5)
