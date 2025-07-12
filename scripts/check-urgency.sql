SELECT urgency, COUNT(*) 
FROM "Task" 
GROUP BY urgency 
ORDER BY urgency;
