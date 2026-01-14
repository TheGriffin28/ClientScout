import cron from "node-cron";
import Lead from "../models/Lead.js";

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
};
