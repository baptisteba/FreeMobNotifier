#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PWA build...');

const distPath = path.join(__dirname, '../src/client/dist');
const requiredFiles = [
  'index.html',
  'manifest.json',
  'sw.js',
  'offline.html',
  'browserconfig.xml',
  'icons'
];

const requiredIconSizes = [
  '72x72', '96x96', '128x128', '144x144', 
  '152x152', '192x192', '384x384', '512x512'
];

let allChecksPassed = true;

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory not found:', distPath);
  process.exit(1);
}

console.log('✅ Build directory found');

// Check for required files
requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} found`);
  } else {
    console.error(`❌ ${file} missing`);
    allChecksPassed = false;
  }
});

// Check manifest.json content
try {
  const manifestPath = path.join(distPath, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Check required manifest fields
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    requiredFields.forEach(field => {
      if (manifest[field]) {
        console.log(`✅ Manifest has ${field}`);
      } else {
        console.error(`❌ Manifest missing ${field}`);
        allChecksPassed = false;
      }
    });

    // Check for required icon sizes
    if (manifest.icons && Array.isArray(manifest.icons)) {
      const manifestIconSizes = manifest.icons.map(icon => icon.sizes);
      requiredIconSizes.forEach(size => {
        if (manifestIconSizes.some(iconSize => iconSize.includes(size))) {
          console.log(`✅ Manifest has ${size} icon`);
        } else {
          console.warn(`⚠️  Manifest missing ${size} icon (recommended)`);
        }
      });
    }

    // Check critical manifest values
    if (manifest.display === 'standalone') {
      console.log('✅ Manifest display mode is standalone');
    } else {
      console.warn('⚠️  Manifest display mode should be "standalone" for PWA');
    }

    if (manifest.start_url) {
      console.log('✅ Manifest has start_url');
    } else {
      console.error('❌ Manifest missing start_url');
      allChecksPassed = false;
    }
  }
} catch (error) {
  console.error('❌ Error reading manifest.json:', error.message);
  allChecksPassed = false;
}

// Check service worker content
try {
  const swPath = path.join(distPath, 'sw.js');
  if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Check for essential service worker features
    const requiredSWFeatures = [
      'install',
      'activate',
      'fetch',
      'caches',
      'CACHE_NAME'
    ];

    requiredSWFeatures.forEach(feature => {
      if (swContent.includes(feature)) {
        console.log(`✅ Service worker has ${feature} functionality`);
      } else {
        console.warn(`⚠️  Service worker missing ${feature} (may impact offline functionality)`);
      }
    });
  }
} catch (error) {
  console.error('❌ Error reading service worker:', error.message);
  allChecksPassed = false;
}

// Check HTML for PWA meta tags
try {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    const requiredMetaTags = [
      'manifest',
      'theme-color',
      'apple-mobile-web-app-capable',
      'apple-mobile-web-app-title'
    ];

    requiredMetaTags.forEach(tag => {
      if (htmlContent.includes(tag)) {
        console.log(`✅ HTML has ${tag} meta tag`);
      } else {
        console.warn(`⚠️  HTML missing ${tag} meta tag`);
      }
    });

    // Check for manifest link
    if (htmlContent.includes('rel="manifest"')) {
      console.log('✅ HTML links to manifest');
    } else {
      console.error('❌ HTML does not link to manifest');
      allChecksPassed = false;
    }
  }
} catch (error) {
  console.error('❌ Error reading index.html:', error.message);
  allChecksPassed = false;
}

// Check icons directory
const iconsPath = path.join(distPath, 'icons');
if (fs.existsSync(iconsPath)) {
  const iconFiles = fs.readdirSync(iconsPath);
  console.log(`✅ Icons directory contains ${iconFiles.length} files`);
  
  // Check for basic icon files
  if (iconFiles.length > 0) {
    console.log('📱 Available icons:', iconFiles.join(', '));
  } else {
    console.warn('⚠️  Icons directory is empty - generate icons using /generate-icons.html');
  }
} else {
  console.warn('⚠️  Icons directory not found');
}

// Final report
console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('🎉 PWA build verification PASSED!');
  console.log('📱 Your app is ready for PWA installation');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy with HTTPS for full PWA functionality');
  console.log('2. Test installation on different devices');
  console.log('3. Run Lighthouse PWA audit: npm run pwa:audit');
  process.exit(0);
} else {
  console.log('❌ PWA build verification FAILED!');
  console.log('🔧 Please fix the issues above before deploying');
  process.exit(1);
} 