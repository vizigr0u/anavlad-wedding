import './style/AdminPanel.css'

import UsersView from './UsersView';
import AddUserForm from './AddUserForm';
import DBBackupAndRestore from './DBBackupAndRestore';
import AttendeesData from './AttendeesData';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import AdminNotifications from './AdminNotifications';
import TableTest from './TableSeatingChart/TableTest';
import { UserData } from '../../types';
import { useContext, useState } from 'react';
import { ConfigContext } from '../../AppConfigContext';

const EnableTableTest = false; // disable table test until it's ready, it needs some work/tweaks.

export default function AdminPanel({ userData }: { userData: UserData }) {
    const config = useContext(ConfigContext);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const { data: attendeesData, isLoading: attendeesLoading } = useQuery({
        queryKey: ['get_attendees'],
        queryFn: () =>
            axios.get("/api/attendees").then((res) => res.data),
        refetchInterval: config.adminConfig.dataRefreshRateMs,
        enabled: autoRefresh
    });

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['get_users'],
        queryFn: () =>
            axios.get("/api/users").then((res) => res.data),
        refetchInterval: config.adminConfig.dataRefreshRateMs,
        enabled: autoRefresh
    });

    return (
        <>
            <h1>Admin Panel</h1>
            {/* <PreviewAsUserLevel userlevel={userData.userLevel} /> */}
            <AdminNotifications isLoading={usersLoading || attendeesLoading} lastNotif={userData?.admin?.lastViewedNotif} usersData={usersData} attendeesData={attendeesData} />
            <input type='checkbox' id='auto-refresh' checked={autoRefresh} onChange={() => setAutoRefresh((v) => !v)} />
            <label htmlFor='auto-refresh'>Auto-refresh users and attendees ({config.adminConfig.dataRefreshRateMs} ms)</label>
            {attendeesData && <AttendeesData data={attendeesData} adminData={userData.admin} />}
            {usersData && <UsersView userData={userData} users={usersData} />}
            <AddUserForm />
            <DBBackupAndRestore />
            {EnableTableTest && attendeesData && <TableTest data={attendeesData} />}
        </>
    );
}
