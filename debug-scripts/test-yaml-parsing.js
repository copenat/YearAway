#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Copy the parseYAML function from tips-manager.js
function parseYAML(yamlText) {
    const data = { tips: [], categories: [] };
    const lines = yamlText.split('\n');
    let currentSection = null;
    let currentItem = null;
    let descriptionLines = [];
    let inDescription = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Section headers
        if (trimmed === 'tips:') {
            // Save previous item before switching sections
            if (currentItem) {
                if (descriptionLines.length > 0) {
                    currentItem.description = descriptionLines.join('\n').trim();
                    descriptionLines = [];
                }
                data[currentSection].push(currentItem);
                currentItem = null;
            }
            currentSection = 'tips';
            continue;
        } else if (trimmed === 'categories:') {
            // Save previous item before switching sections
            if (currentItem) {
                if (descriptionLines.length > 0) {
                    currentItem.description = descriptionLines.join('\n').trim();
                    descriptionLines = [];
                }
                data[currentSection].push(currentItem);
                currentItem = null;
            }
            currentSection = 'categories';
            continue;
        }
        
        // New item (for all sections)
        if (trimmed.startsWith('- id:')) {
            // Save previous item
            if (currentItem) {
                if (descriptionLines.length > 0) {
                    currentItem.description = descriptionLines.join('\n').trim();
                    descriptionLines = [];
                }
                data[currentSection].push(currentItem);
            }
            
            // Start new item
            const id = trimmed.split(': ')[1].replace(/['"]/g, '');
            currentItem = { id };
            inDescription = false;
            continue;
        }
        
        // Item properties
        if (currentItem && trimmed.includes(': ') && !inDescription) {
            const [key, ...valueParts] = trimmed.split(': ');
            const value = valueParts.join(': ');
            
            if (key === 'description' && value === '|') {
                inDescription = true;
                continue;
            } else if (key === 'description') {
                currentItem[key] = value;
                continue;
            } else if (key === 'tags') {
                // Parse array format [item1, item2, item3]
                currentItem[key] = value.slice(1, -1).split(', ').map(tag => tag.trim());
            } else if (key === 'rating' || key === 'isPublic') {
                currentItem[key] = key === 'isPublic' ? value === 'true' : parseInt(value);
            } else if (key === 'publicTips' || key === 'membersOnlyTips' || key === 'totalTips') {
                currentItem[key] = parseInt(value);
            } else {
                // Remove quotes from string values (common in YAML)
                currentItem[key] = value.replace(/^["']|["']$/g, '');
            }
            continue;
        }
        
        // Description content (indented lines after description: |)
        if (inDescription) {
            // Check if this line starts a new property (less indented than description content)
            if (trimmed && !line.startsWith('      ') && trimmed.includes(': ')) {
                // This is a new property, end description parsing
                inDescription = false;
                // Process this line as a property
                if (currentItem && trimmed.includes(': ')) {
                    const [key, ...valueParts] = trimmed.split(': ');
                    const value = valueParts.join(': ');
                    
                    if (key === 'tags') {
                        currentItem[key] = value.slice(1, -1).split(', ').map(tag => tag.trim());
                    } else if (key === 'rating' || key === 'isPublic') {
                        currentItem[key] = key === 'isPublic' ? value === 'true' : parseInt(value);
                    } else if (key === 'publicTips' || key === 'membersOnlyTips' || key === 'totalTips') {
                        currentItem[key] = parseInt(value);
                    } else {
                        currentItem[key] = value.replace(/^["']|["']$/g, '');
                    }
                }
                continue;
            }
            
            // This is still part of the description - ALWAYS add it
            if (line.trim()) {
                // For HTML content, we need to be more careful about whitespace
                // The YAML multiline format uses 6 spaces for indentation
                // We want to preserve the content but remove the YAML indentation
                let content = line;
                
                // Remove YAML indentation (6 spaces) but preserve HTML formatting
                if (content.startsWith('      ')) {
                    content = content.substring(6);
                }
                
                descriptionLines.push(content);
            } else {
                // Add empty line to preserve formatting
                descriptionLines.push('');
            }
            continue;
        }
    }
    
    // Save last item
    if (currentItem) {
        if (descriptionLines.length > 0) {
            currentItem.description = descriptionLines.join('\n').trim();
        }
        data[currentSection].push(currentItem);
    }
    
    return data;
}

// Test the parsing
function testParsing() {
    console.log('🧪 Testing YAML Parsing...\n');
    
    // Read the tips-data-members.yaml file
    const yamlPath = path.join(__dirname, '../and-now/content/tips-data-members.yaml');
    
    try {
        const yamlContent = fs.readFileSync(yamlPath, 'utf8');
        console.log('📄 YAML file loaded successfully');
        console.log(`📊 File size: ${yamlContent.length} characters\n`);
        
        // Parse the YAML
        const parsedData = parseYAML(yamlContent);
        
        console.log('✅ Parsing completed successfully!');
        console.log(`📊 Parsed data:`, {
            tipsCount: parsedData.tips.length,
            categoriesCount: parsedData.categories.length
        });
        
        // Find the International Driving Licence tip
        const idlTip = parsedData.tips.find(tip => tip.id === 'international-driving-licence');
        
        if (idlTip) {
            console.log('\n🎯 International Driving Licence tip found!');
            console.log('📝 Title:', idlTip.title);
            console.log('📝 Category:', idlTip.category);
            console.log('📝 Tags:', idlTip.tags);
            console.log('📝 Rating:', idlTip.rating);
            console.log('\n📄 Description:');
            console.log('─'.repeat(50));
            console.log(idlTip.description);
            console.log('─'.repeat(50));
            console.log(`📊 Description length: ${idlTip.description.length} characters`);
            console.log(`📊 Description lines: ${idlTip.description.split('\n').length}`);
        } else {
            console.log('\n❌ International Driving Licence tip NOT found!');
            console.log('📋 Available tips:');
            parsedData.tips.forEach(tip => {
                console.log(`  - ${tip.id}: ${tip.title}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testParsing();
