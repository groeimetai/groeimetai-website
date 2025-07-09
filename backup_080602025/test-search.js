// Test script voor de search API
// Run met: node test-search.js

async function testSearch() {
  try {
    // Test zoekquery
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'AI consulting',
        locale: 'en',
        limit: 5,
        includeContext: true,
      }),
    });

    const data = await response.json();

    console.log('Search API Response:');
    console.log('Status:', response.status);
    console.log('Total Results:', data.totalResults);
    console.log('\nTop Results:');

    data.results?.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Score: ${result.score}`);
      console.log(`   Type: ${result.type}`);
      if (result.context) {
        console.log(`   Context: ${result.context.substring(0, 100)}...`);
      }
    });
  } catch (error) {
    console.error('Error testing search:', error);
  }
}

testSearch();
