#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files and directories to remove from the old project
const filesToRemove = [
  '../landing.html',
  '../landing.css',
  '../landing.js',
  '../premium-enhancements.css',
  '../database.js',
  '../realtime-sync.js',
  '../hook.js',
  '../index.html',
  '../privacy.html',
  '../terms.html',
  '../start-server.sh',
  '../start-server.bat',
  '../README.md' // Will be replaced with new one
];

console.log('🧹 Starting cleanup of old WIN07 files...\n');

let removedCount = 0;
let errorCount = 0;

filesToRemove.forEach(filePath => {
  const fullPath = path.resolve(__dirname, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`📁 Removed directory: ${filePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`📄 Removed file: ${filePath}`);
      }
      
      removedCount++;
    } else {
      console.log(`⚠️  File not found (already removed?): ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error.message);
    errorCount++;
  }
});

// Copy new README to parent directory
try {
  const newReadmePath = path.resolve(__dirname, 'README.md');
  const parentReadmePath = path.resolve(__dirname, '../README.md');
  
  if (fs.existsSync(newReadmePath)) {
    fs.copyFileSync(newReadmePath, parentReadmePath);
    console.log('📄 Updated README.md in parent directory');
  }
} catch (error) {
  console.error('❌ Error updating README:', error.message);
  errorCount++;
}

console.log(`\n✅ Cleanup completed!`);
console.log(`📊 Summary:`);
console.log(`   - Files removed: ${removedCount}`);
console.log(`   - Errors: ${errorCount}`);

if (errorCount === 0) {
  console.log(`\n🎉 All old files have been successfully removed!`);
  console.log(`🚀 Your new Next.js WIN07 platform is ready to use.`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. cd win07-nextjs`);
  console.log(`   2. npm run dev`);
  console.log(`   3. Open http://localhost:3000`);
} else {
  console.log(`\n⚠️  Some files couldn't be removed. Please check the errors above.`);
}

console.log(`\n🎮 Welcome to the new WIN07 platform! 🎮`);