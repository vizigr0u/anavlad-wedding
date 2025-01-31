import './style/AdminNotifications.css'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface AdminNotificationsProps {
  isLoading: boolean;
  lastNotif: string | undefined; // Replace 'any' with the appropriate type
  usersData: any; // Replace 'any' with the appropriate type
  attendeesData: any; // Replace 'any' with the appropriate type
}

export default function AdminNotifications({ isLoading, lastNotif, usersData, attendeesData }: AdminNotificationsProps) {
  const lastNotifDate = (lastNotif ? new Date(lastNotif) : new Date(2023, 3, 2, 11, 5));
  const lastNotifTime = lastNotifDate.getTime();
  const newUserActivities = usersData?.filter((u: { last_login: string; }) => new Date(u.last_login).getTime() > lastNotifTime) ?? [];
  const userNewActivitiesCount = newUserActivities.length;
  const newAttendeesActivities = attendeesData?.filter((u: { last_edit: string; }) => new Date(u.last_edit).getTime() > lastNotifTime) ?? [];
  const attendeesNewActivitiesCount = newAttendeesActivities.length;
  const totalNotifs = userNewActivitiesCount + attendeesNewActivitiesCount;

  const queryClient = useQueryClient();

  const dismissMutation = useMutation({
    mutationFn: () => {
      return axios.patch('/api/dismiss_admin_notifications');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_user_data'] })
  })

  return <div className={'admin-notifications' + (totalNotifs > 0 ? ' admin-notifications__unread' : '')}>
    {isLoading && <span className='admin-notifications__loading'></span>}
    {totalNotifs === 0 ? <>No new notif. since {lastNotifDate.toLocaleString()}.</> :
      <>
        {userNewActivitiesCount} new user activitie(s) and {attendeesNewActivitiesCount} new attendees activitie(s)
        since {lastNotifDate.toLocaleString()}
        <button className='admin-notification__dismiss-button' onClick={() => dismissMutation.mutate()}>Mark read</button>
      </>}
  </div>;
}
