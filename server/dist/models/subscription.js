import conn from "@/config/database";
export const createSubscription = async (subscription) => {
    try {
        const sql = "INSERT INTO subscriptions (user_id, subscription_id, status, plan_id, start_date, next_billing_date, payment_id, payer_id, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const [result] = await conn.execute(sql, [
            subscription.user_id,
            subscription.subscription_id,
            subscription.status,
            subscription.plan_id,
            subscription.start_date,
            subscription.next_billing_date,
            subscription.payment_id,
            subscription.payer_id,
            subscription.amount
        ]);
        return result.insertId;
    }
    catch (error) {
        console.error(`Error creating subscription: ${error}`);
        throw error;
    }
};
export const getSubscriptionByUserId = async (userId) => {
    try {
        const sql = "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";
        const [result] = await conn.execute(sql, [userId]);
        return result[0] || null;
    }
    catch (error) {
        console.error(`Error fetching subscription: ${error}`);
        throw error;
    }
};
export const getSubscriptionByPayPalId = async (subscriptionId) => {
    try {
        const sql = "SELECT * FROM subscriptions WHERE subscription_id = ?";
        const [result] = await conn.execute(sql, [subscriptionId]);
        return result[0] || null;
    }
    catch (error) {
        console.error(`Error fetching subscription: ${error}`);
        throw error;
    }
};
export const updateSubscriptionStatus = async (subscriptionId, status) => {
    try {
        const sql = "UPDATE subscriptions SET status = ? WHERE subscription_id = ?";
        const [result] = await conn.execute(sql, [status, subscriptionId]);
        return result.affectedRows > 0;
    }
    catch (error) {
        console.error(`Error updating subscription status: ${error}`);
        throw error;
    }
};
export const getAllSubscriptions = async () => {
    try {
        const sql = `
      SELECT s.*, u.username, u.full_name, u.email, u.role 
      FROM subscriptions s
      JOIN users u ON s.user_id = u.user_id
      ORDER BY s.created_at DESC
    `;
        const [result] = await conn.execute(sql);
        return result;
    }
    catch (error) {
        console.error(`Error fetching all subscriptions: ${error}`);
        throw error;
    }
};
