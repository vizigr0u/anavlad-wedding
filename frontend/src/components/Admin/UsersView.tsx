import './style/UsersView.css'

import { JSX, memo, useState } from 'react';

import { Delete, PlusOne, Visibility } from '@mui/icons-material';
import { FixedSizeList as List } from 'react-window';

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from "axios";
import { Button } from '@mui/material';

import ConfirmDialog from './ConfirmDialog';
import CopyToClipboardButton from '../CopyToClipboardButton';
import Collapsable from './Collapsable';
import { GetRelativeTimeString } from '../../TimeUtils';
import useRefreshInterval from '../../hooks/UseRefreshInterval';
import { UserData, WeddingData } from '../../types';
import { AdminUserData } from './types';
import { DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import memoize from 'memoize-one';
import dayjs, { Dayjs } from 'dayjs';

import { ListChildComponentProps } from 'react-window';

const columnNames = ['e-mail', 'Token', 'Num logins', 'Last login', 'RSVP Limit', 'Lang', 'Controls'];

function UserHeader() {
  return <div className="user-row user-row--header">
    {columnNames.map((name, index) => <div key={index} className='user-row__cell'>{name}</div>)}
  </div>
}

function LoginLink({ token, lang }: { token: string, lang: string }) {
  const title = token; //`${token.substring(0, 5)}...${token.substring(token.length - 5)}`
  const link = `/?token=${token}&lng=${lang ?? 'en'}`;
  const absoluteLink = new URL(link, document.baseURI).href;
  return (<div className='login-link'>
    <a href={link}>{title}</a>
    <CopyToClipboardButton text={absoluteLink} message='Link copied to clipboard' />
  </div>)
}

function LastLogin({ user }: { user: AdminUserData }): JSX.Element {
  useRefreshInterval(1000);
  return <>{user.last_login ? GetRelativeTimeString(new Date(user.last_login)) : 'never'}</>;
}

const dayJsDates: { [key: number | string]: Dayjs } = {};

function RSVPLimit({ answer_date, editable, onDateChange }: { answer_date: number | string, editable: boolean, onDateChange: (date: Date) => void }) {
  // return <div className="answer-time" >{new Date(answer_date).toDateString()}</div>
  if (!editable) {
    return <div className="answer-time" >{new Date(answer_date).toDateString()}</div>
  }

  if (!dayJsDates[answer_date]) {
    dayJsDates[answer_date] = dayjs(new Date(answer_date));
  }

  return <DatePicker
    value={dayJsDates[answer_date]}
    onChange={date => date && onDateChange(date.toDate())}
  />;
}

function AddAttendeeButton({ onClick }: { onClick: () => void }) {
  return (<button title="add guest" onClick={onClick}>
    <PlusOne />
  </button>)
}

function DeleteButton({ onClick, disabled = false }: { onClick: () => void, disabled?: boolean }) {
  return (<Button title='delete user' disabled={disabled} className='delete-icon'>
    <Delete onClick={onClick} />
  </Button>)
}

function ViewAsButton({ onClick, disabled = false }: { onClick: () => void, disabled?: boolean }) {
  return (<Button title='View as user' disabled={disabled} className='view-as-icon'>
    <Visibility onClick={onClick} />
  </Button>)
}

const UserRow = memo(({ data, index, isScrolling, style }
  : ListChildComponentProps<{
    users: AdminUserData[],
    userData: UserData,
    onDateChange: (userId: number, date: Date) => void,
    onViewAs: (userId: number) => void,
    onClickDelete: (userId: number) => void,
    onAddAttendee: (userId: number) => void
  }>) => {
  const { users, userData, onDateChange, onViewAs, onClickDelete, onAddAttendee } = data;
  const { weddingData, admin: adminData } = userData;
  const user = users[index];
  const answer_date: number | string = user.rsvp_limit_time ?? weddingData.answer_date;

  return (
    <div style={style} className="user-row">
      <div className='user-row__cell'>{user.email}</div>
      <div className='user-row__cell'><LoginLink lang={user.lang} token={user.token} /></div>
      <div className='user-row__cell'>{user.login_count}</div>
      <div className='user-row__cell'><LastLogin user={user} /></div>
      <div className='user-row__cell'><RSVPLimit answer_date={answer_date} editable={!isScrolling} onDateChange={(date) => onDateChange(user.user_id, date)} /></div>
      <div className='user-row__cell'>{user.lang}</div>
      <div className='user-row__cell'>
        <ViewAsButton onClick={() => onViewAs(user.user_id)} disabled={adminData?.previewUserId === user.user_id} />
        <AddAttendeeButton onClick={() => onAddAttendee(user.user_id)} />
        <DeleteButton onClick={() => onClickDelete(user.user_id)} disabled={user.user_id === 1} />
      </div>
    </div>
  );
});

export default function UsersView({ users, userData }: { users: AdminUserData[], userData: UserData }) {
  const [idToDelete, setIdToDelete] = useState<number | undefined>(undefined);

  const { weddingData, admin } = userData;
  const lastNotif = admin?.lastViewedNotif;
  const queryClient = useQueryClient()

  function compareUsers(a1: AdminUserData, a2: AdminUserData) {
    return -(new Date(a1.last_login).getTime() - new Date(a2.last_login).getTime());
  }

  users.sort(compareUsers);

  const lastNotifDate = (lastNotif ? new Date(lastNotif) : new Date(2023, 3, 2, 11, 5));
  const lastNotifTime = lastNotifDate.getTime();
  function wasUpdateRecently(user: AdminUserData) {
    return new Date(user.last_login).getTime() > lastNotifTime;
  }
  const groupHasNewActivity = users.length > 0 && wasUpdateRecently(users[0]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return axios.delete('/api/user/' + id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_users'] })
  })

  const addAttendeeMutation = useMutation({
    mutationFn: (id: number) => {
      console.log(`Posting ${'/api/attendees/' + id}`);
      return axios.post('/api/attendees/' + id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_users'] })
  });

  const changeViewAsMutation = useMutation({
    mutationFn: (id: number) => {
      return axios.post('/api/view_as_user/' + id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_user_data'] })
  })

  const changeRsvpLimitMutation = useMutation({
    mutationFn: ({ userId, date }: { userId: number, date: Date }) => {
      return axios.patch('/api/user/' + userId, { rsvp_limit_time: date.toISOString() });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_user_data'] })
  })

  function LoginLink({ token, lang }: { token: string, lang: string }) {
    const title = token; //`${token.substring(0, 5)}...${token.substring(token.length - 5)}`
    const link = `/?token=${token}&lng=${lang ?? 'en'}`;
    const absoluteLink = new URL(link, document.baseURI).href;
    return (<div className='login-link'>
      <a href={link}>{title}</a>
      <CopyToClipboardButton text={absoluteLink} message='Link copied to clipboard' />
    </div>)
  }

  function LastLogin({ user }: { user: AdminUserData }): JSX.Element {
    useRefreshInterval(1000);
    return <>{user.last_login ? GetRelativeTimeString(new Date(user.last_login)) : 'never'}</>;
  }

  function DeleteDialog() {
    if (idToDelete === undefined)
      return null;
    return (
      <ConfirmDialog key="1" title={`Delete user ${idToDelete}?`}
        onClose={() => setIdToDelete(undefined)}
        onConfirm={() => deleteMutation.mutate(idToDelete)}>
        {`Are you sure you want to delete user ${idToDelete}?`}
      </ConfirmDialog>
    )
  }

  function RSVPLimit({ user }: { user: AdminUserData }) {
    return <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={dayjs(new Date(user.rsvp_limit_time ?? weddingData.answer_date))}
        onChange={date => date && changeRsvpLimitMutation.mutate({ userId: user.user_id, date: date.toDate() })}
      />
    </LocalizationProvider >
  }

  function AddAttendeeButton({ userId }: { userId: number }) {
    return (<button title="add guest" onClick={() => addAttendeeMutation.mutate(userId)}>
      <PlusOne />
    </button>)
  }

  function DeleteButton({ userId }: { userId: number }) {
    return (<Button title='delete user' disabled={userId === 1} className='delete-icon'>
      <Delete onClick={() => setIdToDelete(userId)} />
    </Button>)
  }

  function ViewAsButton({ userId }: { userId: number }) {
    return (<Button title='View as user' disabled={admin?.previewUserId === userId} className='view-as-icon'>
      <Visibility onClick={() => changeViewAsMutation.mutate(userId)} />
    </Button>)
  }

  const createData = memoize((users: AdminUserData[], userData: UserData) => ({
    users,
    userData,
    onDateChange: (userId: number, date: Date) => changeRsvpLimitMutation.mutate({ userId, date }),
    onViewAs: (userId: number) => changeViewAsMutation.mutate(userId),
    onClickDelete: (userId: number) => setIdToDelete(userId),
    onAddAttendee: (userId: number) => addAttendeeMutation.mutate(userId)
  }));
  const data = createData(users, userData);

  return (
    <div className="users-view">
      <Collapsable title={'Users' + (groupHasNewActivity ? '*' : '')} >
        <UserHeader />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <List useIsScrolling
            height={300}
            itemCount={users.length}
            itemData={data}
            itemSize={60}
            width={1500}
          >
            {UserRow}
          </List>
        </LocalizationProvider>
        <DeleteDialog />
      </Collapsable>
    </div >
  );
}
