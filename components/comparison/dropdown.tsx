import React, { useEffect, useState } from "react";


interface Activity {
  id: string;
  name: string;
}

const Dropdown: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("https://www.strava.com/api/v3/athlete/activities", {
          headers: {
            Authorization: `Bearer YOUR_ACCESS_TOKEN`,
          },
        });
        const data = await response.json();
        setActivities(data.slice(0, 2)); // Limit to two activities
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div>
      <select onChange={(e) => setSelectedActivity(e.target.value)} value={selectedActivity}>
        <option value="">Select an activity</option>
        {activities.map((activity) => (
          <option key={activity.id} value={activity.id}>
            {activity.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;