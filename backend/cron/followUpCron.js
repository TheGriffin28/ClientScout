import cron from "node-cron";
import Lead from "../models/Lead.js";
import User from "../models/User.js";

// Schedule tasks to be run on the server.
export const setupCronJobs = () => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily cron job: Check overdue follow-ups");
    
    try {
      const today = new Date();
      
      // Find leads that are overdue and not yet marked as such
      // Note: We are just logging for now, or we could update a status if we had an 'Overdue' status
      const overdueLeads = await Lead.find({
        nextFollowUp: { $lt: today },
        status: { $nin: ["Converted", "Lost", "Contacted"] }
      });

      console.log(`Found ${overdueLeads.length} overdue leads.`);
      
      // In a real app, we might send email notifications here
      // for (const lead of overdueLeads) {
      //   sendNotification(lead.user, `Follow up overdue for ${lead.businessName}`);
      // }

    } catch (error) {
      console.error("Error in daily cron job:", error);
    }
  });

  // Run on the 1st of every month at midnight to reset usage limits
  cron.schedule("0 0 1 * *", async () => {
    console.log("Running monthly cron job: Reset user usage limits");
    try {
      const result = await User.updateMany({}, {
        $set: {
          aiUsageCount: 0,
          mapSearchCount: 0,
          emailUsageCount: 0
        }
      });
      console.log(`Reset monthly limits for ${result.modifiedCount} users.`);
    } catch (error) {
      console.error("Error in monthly cron job:", error);
    }
  });
};
