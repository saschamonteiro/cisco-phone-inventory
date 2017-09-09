# cisco-phone-inventory

Utility to extract Cisco IPPhones with registration status and optional serial-number (if webservice on the phone is enabled and reachable!)

## Requires
Node.JS 8.4.0 or higher

## Install
Clone/download this repo  
npm install

## Run
UCM_HOST=x.x.x.x UCM_USER=administrator UCM_PASS=password UCM_VERSION=11.5 GET_SERIALS=true node index.js 
