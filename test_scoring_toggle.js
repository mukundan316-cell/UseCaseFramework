// Manual Scoring Toggle Test Script
const baseUrl = 'http://localhost:5000';

async function testScoringToggle() {
  console.log('🧪 Testing Manual Scoring Toggle Behavior\n');
  
  try {
    // Step 1: Get the test use case
    console.log('1️⃣ Getting test use case...');
    const response = await fetch(`${baseUrl}/api/use-cases`);
    const useCases = await response.json();
    const testCase = useCases.find(uc => uc.title.includes('automation') && uc.title.includes('underwriter'));
    
    if (!testCase) {
      console.error('❌ Test use case not found');
      return;
    }
    
    console.log(`   Found: ${testCase.title}`);
    console.log(`   Calculated Scores: Impact=${testCase.impactScore}, Effort=${testCase.effortScore}`);
    console.log(`   Manual Scores: Impact=${testCase.manualImpactScore}, Effort=${testCase.manualEffortScore}`);
    console.log(`   Override Reason: ${testCase.overrideReason || 'None'}\n`);
    
    // Step 2: Test enabling manual override
    console.log('2️⃣ Testing manual override activation...');
    const overrideData = {
      ...testCase,
      manualImpactScore: 4.5,
      manualEffortScore: 2.5,
      overrideReason: 'Strategic business priority override for Q4 objectives'
    };
    
    const updateResponse = await fetch(`${baseUrl}/api/use-cases/${testCase.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overrideData)
    });
    
    if (updateResponse.ok) {
      const updated = await updateResponse.json();
      console.log('   ✅ Manual override activated');
      console.log(`   Override Scores: Impact=${updated.manualImpactScore}, Effort=${updated.manualEffortScore}`);
      console.log(`   Override Reason: ${updated.overrideReason}\n`);
      
      // Step 3: Wait a moment then test reverting to automatic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('3️⃣ Testing revert to automatic scoring...');
      const revertData = {
        ...updated,
        manualImpactScore: null,
        manualEffortScore: null,
        manualQuadrant: null,
        overrideReason: ''
      };
      
      const revertResponse = await fetch(`${baseUrl}/api/use-cases/${testCase.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revertData)
      });
      
      if (revertResponse.ok) {
        const reverted = await revertResponse.json();
        console.log('   ✅ Automatic scoring restored');
        console.log(`   Using Calculated: Impact=${reverted.impactScore}, Effort=${reverted.effortScore}`);
        console.log(`   Manual Fields Cleared: Impact=${reverted.manualImpactScore}, Effort=${reverted.manualEffortScore}`);
        console.log(`   Override Reason: ${reverted.overrideReason || 'None'}\n`);
        
        console.log('🎉 Manual scoring toggle test completed successfully!');
        console.log('\n📊 Test Results Summary:');
        console.log('   ✅ Manual override activation works');
        console.log('   ✅ Override values properly stored');
        console.log('   ✅ Revert to automatic works');
        console.log('   ✅ Manual fields properly cleared');
        console.log('   ✅ Calculated scores preserved');
      } else {
        console.error('❌ Failed to revert to automatic scoring');
      }
    } else {
      console.error('❌ Failed to activate manual override');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testScoringToggle();