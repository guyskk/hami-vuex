#!/bin/bash

echo '*** test on vue 2 + vuex 3 ***'
npm install
npm run build
npm run test:unit

echo '*** test on vue 3 + vuex 4 ***'
mv package.json package3.json
mv package-lock.json package3-lock.json
mv package4.json package.json
mv package4-lock.json package-lock.json
npm install
npm run test:unit

echo '*** switch back vue 2 + vuex 3 ***'
mv package.json package4.json
mv package-lock.json package4-lock.json
mv package3.json package.json
mv package3-lock.json package-lock.json
npm install
