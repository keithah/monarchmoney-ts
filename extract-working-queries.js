#!/usr/bin/env node

const fs = require('fs');

// Extract working GraphQL patterns from HAR
const harData = JSON.parse(fs.readFileSync('indivivdual.har', 'utf8'));

const graphqlRequests = harData.log.entries
  .filter(entry =>
    entry.request.url.includes('/graphql') &&
    entry.request.postData &&
    entry.request.postData.text &&
    entry.request.postData.text.includes('operationName')
  )
  .map(entry => {
    try {
      return JSON.parse(entry.request.postData.text);
    } catch (e) {
      return null;
    }
  })
  .filter(Boolean);

console.log('🔍 Working GraphQL patterns from HAR:\n');

graphqlRequests.forEach((req, i) => {
  console.log(`${i + 1}. ${req.operationName}`);
  console.log('Variables:', JSON.stringify(req.variables, null, 2));
  console.log('Query:', req.query.substring(0, 200) + '...\n');
});

// Find account-specific queries
const accountQueries = graphqlRequests.filter(req =>
  req.query.toLowerCase().includes('account') &&
  !req.query.toLowerCase().includes('accounts {')
);

console.log('\n🎯 Account-specific queries:');
accountQueries.forEach(req => {
  console.log(`\n${req.operationName}:`);
  console.log(req.query);
  console.log('Variables:', JSON.stringify(req.variables, null, 2));
});