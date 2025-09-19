#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test what the browser is actually loading
function testBrowserJS() {
    console.log('🌐 Testing what the browser is actually loading...\n');
    
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/and-now/js/tips-manager.js?v=67',
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        console.log(`📡 Status: ${res.statusCode}`);
        console.log(`📡 Headers:`, res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`📊 Response size: ${data.length} characters`);
            
            // Check for the problematic line
            if (data.includes('Exit description mode when we encounter a property')) {
                console.log('❌ Found the problematic line in browser version!');
            } else {
                console.log('✅ Problematic line NOT found in browser version');
            }
            
            // Check for our fix
            if (data.includes('Check if this line starts a new property (less indented than description content)')) {
                console.log('✅ Found our fix in browser version!');
            } else {
                console.log('❌ Our fix NOT found in browser version!');
            }
            
            // Extract a sample of the description parsing logic
            const descriptionStart = data.indexOf('// Description content (indented lines after description: |)');
            if (descriptionStart >= 0) {
                const sample = data.substring(descriptionStart, descriptionStart + 500);
                console.log('\n📋 Description parsing logic sample:');
                console.log('─'.repeat(50));
                console.log(sample);
                console.log('─'.repeat(50));
            }
        });
    });
    
    req.on('error', (e) => {
        console.error(`❌ Error: ${e.message}`);
    });
    
    req.end();
}

testBrowserJS();
