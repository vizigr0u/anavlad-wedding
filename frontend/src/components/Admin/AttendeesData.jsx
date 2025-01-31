import './style/AttendeesData.css'

import Collapsable from './Collapsable';
import useRefreshInterval from '../../hooks/UseRefreshInterval';
import RelativeTime from './RelativeTime';
import CopyToClipboardButton from '../CopyToClipboardButton';

function FoodOption({ option }) {
  switch (option) {
    case 'option-fish':
      return '🐟';
    case 'option-meat':
      return '🥩';
    default:
      return '❔';
  }
}

function AttendeesView({ title, attendees, showFood, lastNotif }) {
  const lastNotifDate = (lastNotif ? new Date(lastNotif) : new Date(2023, 3, 2, 11, 5));
  const lastNotifTime = lastNotifDate.getTime();
  function wasUpdateRecently(attendee) {
    return new Date(attendee.last_edit).getTime() > lastNotifTime;
  }

  if (!attendees?.length)
    return <button disabled={true}>{title} ({0})</button>;

  function compareUsers(a1, a2) {
    return -(new Date(a1.last_edit).getTime() - new Date(a2.last_edit).getTime());
  }

  const byUser = Object.values(groupBy(attendees, 'user_id'))
    .map(attendees => ({
      attendees: attendees,
      user_id: attendees[0].user_id,
      last_edit: attendees.reduce((a, v) => {
        if (!a)
          return v?.last_edit ? new Date(v?.last_edit) : null;
        if (!v?.last_edit)
          return a;
        return new Date(Math.max(new Date(v.last_edit), a))
      }, null)
    })).sort(compareUsers);
  const groupHasNewActivity = attendees.length > 0 && wasUpdateRecently(byUser[0]);

  return <Collapsable title={`${title} (${attendees.length})`} styleNames={'attendee-view__collapsable' + (groupHasNewActivity ? ' attendee-view__collapsable--new ' : '')} >
    <div className='attendee-view attendee-view-header'>
      <a className='attendee-view-header__name'>Name</a>
      <span className='attendee-view-header__food'>Food</span>
      <span className='attendee-view-header__comment'>Comment</span>
      <a className='attendee-view-header__last-edit'>Last edit</a>
    </div>
    {byUser.map(u => (
      <div key={u.user_id} className='attendee-group-view'>
        {u.attendees.map(att => (<div key={att.attendee_id} className={'attendee-view' + (wasUpdateRecently(att) ? ' attendee-view--new' : '')}>
          <span className='attendee-view__name'>{att.name}</span>
          <span className='attendee-view__food'>{showFood && <FoodOption option={att.food_preferences} />}</span>
          <span className='attendee-view__comment'>{att.comment}</span>
          <RelativeTime styleName='attendee-view__last-edit' time={att.last_edit} />
        </div>))}
      </div>)
    )}
  </Collapsable>;
}

function groupBy(collection, keyName) {
  return collection.reduce(function (r, a) {
    const key = a[keyName];
    r[key] = r[key] || [];
    r[key].push(a);
    return r;
  }, Object.create(null));
}

function AttendeesSummary({ data, adminData }) {
  const { lastViewedNotif } = adminData;
  useRefreshInterval(1000);

  if (!data)
    return null;

  const byRsvp = groupBy(data, 'rsvp_answer');
  const numInvits = data.length;

  const attendeesByFood = groupBy(byRsvp[1], 'food_preferences');
  const numMeat = (attendeesByFood['option-meat'] ?? []).length;
  const numFish = (attendeesByFood['option-fish'] ?? []).length;
  const numUnknown = (attendeesByFood[null] ?? []).length;

  const attendeesCsv = byRsvp[1].map(att => Object.values(att).map(v => String(v)).join(',')).join('\n');
  const attendeesNames = byRsvp[1].map(att => att.name).join(',');

  return <div className='attendees-summary'>
    <h3>{numInvits} invitations :</h3>
    <AttendeesView title={`Yes (${numMeat} 🥩 + ${numFish} 🐟) + ${numUnknown} ❔`} attendees={byRsvp[1]} lastNotif={lastViewedNotif} showFood={true} />
    <AttendeesView title='No' attendees={byRsvp[0]} lastNotif={lastViewedNotif} />
    <AttendeesView title='?' attendees={byRsvp[null]} lastNotif={lastViewedNotif} />
    <div className='attendees-exports'>
      <CopyToClipboardButton text={JSON.stringify(byRsvp[1])} buttonText='Copy Attendees JSON' />
      <CopyToClipboardButton text={attendeesCsv} buttonText='Copy Attendees CSV' />
      <CopyToClipboardButton text={attendeesNames} buttonText='Copy Attendees names' />
    </div>
  </div>
}

export default function AttendeesData({ data, adminData }) {
  return (
    <div className="attendees-view">
      <Collapsable title='Attendees'>
        {!data ? 'loading attendees...' : <AttendeesSummary data={data} adminData={adminData} />}
      </Collapsable>
    </div>
  );
}
