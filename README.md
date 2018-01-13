

DEMO: http://us-central1-fir-lti-35fdc.cloudfunctions.net/ltiLogin


BUID AND DEPLOY LTI-STARTER

STEP 1: Clone lti-starter from github

STEP 2: INSTALL NODE MODULES
$ cd functions
$ npm install

STEP 3: FIREBASE CONFIGURATION
- Change firebase configuration at /functions/src/config.js
- update service-account of firebase project at /functions/service-account.json

STEP 4: BUILD REACT
$ cd functions
$ npm run build

STEP 5: IMPORT FIREBASE REALTIME DATABASE
- File: firebase-import.json

STEP 6: FIREBASE DEPLOYMENT
$ cd lti-starter
$ firebase deploy --only hosting,functions

STEP 7: Open firebase project at https://console.firebase.google.com to get firebase function link


Walkthroughs

Google Instructor: https://drive.google.com/file/d/14Ta0si4Z9akpdWJsI_zwHLu4PcA-G5wL/view?usp=sharing

LTI Instructor: https://drive.google.com/file/d/1bsxBT-OEf6Ymj7DFHVXU_SSZFk915Rg9/view?usp=sharing
