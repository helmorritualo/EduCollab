import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createProduct, createPlan } from './dist/services/paypal.service.js';

// This is a simplified version of the initSubscriptionPlans function
async function initSubscriptionPlans() {
  try {
    console.log('Initializing subscription plans...');
    
    // Create products for student and teacher subscriptions
    const studentProduct = await createProduct(
      'EduCollab Student Subscription',
      'Access to all student features in EduCollab platform',
      'SERVICE'
    );

    const teacherProduct = await createProduct(
      'EduCollab Teacher Subscription',
      'Access to all teacher features in EduCollab platform',
      'SERVICE'
    );

    console.log('Products created successfully');
    console.log('Student Product ID:', studentProduct.id);
    console.log('Teacher Product ID:', teacherProduct.id);

    // Create subscription plans for both products
    // Student plan ($5/month)
    const studentPlan = await createPlan(
      studentProduct.id,
      'Student Monthly Plan',
      'Monthly subscription for students',
      '5.00'
    );

    // Teacher plan ($10/month)
    const teacherPlan = await createPlan(
      teacherProduct.id,
      'Teacher Monthly Plan',
      'Monthly subscription for teachers',
      '10.00'
    );

    return {
      studentPlanId: studentPlan.id,
      teacherPlanId: teacherPlan.id
    };
  } catch (error) {
    console.error('Failed to initialize subscription plans:', error);
    throw error;
  }
}

// Execute the function
async function main() {
  try {
    const plans = await initSubscriptionPlans();
    console.log('\nPlans created successfully:');
    console.log('Student Plan ID:', plans.studentPlanId);
    console.log('Teacher Plan ID:', plans.teacherPlanId);
    console.log('\nAdd these values to your .env file as:');
    console.log(`STUDENT_PLAN_ID=${plans.studentPlanId}`);
    console.log(`TEACHER_PLAN_ID=${plans.teacherPlanId}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
