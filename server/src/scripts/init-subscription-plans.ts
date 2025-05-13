import {initSubscriptionPlans} from '../controllers/subscription.controller';

/**
 * This script initializes subscription plans in PayPal
 * Run this script once to create the Student and Teacher plans
 * The resulting plan IDs should be added to your .env file
 */
async function main() {
  try {
    console.log('Initializing subscription plans...');
    const plans = await initSubscriptionPlans();
    console.log('Plans created successfully:');
    console.log('Student Plan ID:', plans.studentPlanId);
    console.log('Teacher Plan ID:', plans.teacherPlanId);
    console.log('\nAdd these values to your .env file as:');
    console.log(`STUDENT_PLAN_ID=${plans.studentPlanId}`);
    console.log(`TEACHER_PLAN_ID=${plans.teacherPlanId}`);
  } catch (error) {
    console.error('Failed to initialize plans:', error);
  } finally {
    // Force exit since the script may hang due to open connections
    process.exit(0);
  }
}

// Execute the main function
main();
