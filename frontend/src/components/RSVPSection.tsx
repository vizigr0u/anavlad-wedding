import React, { useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import axios from "axios";

import './style/RSVP.css'

import { AttendeeFormLine } from "./AttendeeFormLine";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CircularProgress from '@mui/material/CircularProgress';
import Section from "./Section";
import { GetLocale } from "../translation";
import { UserData, AttendeeData, AttendeeDataToSync } from "../types";
import { ConfigContext } from "../AppConfigContext";

function SaveStatus({ uploading, needsSync }: { uploading: boolean, needsSync: boolean }) {
  const { t } = useTranslation();
  const isSaving = uploading || needsSync;
  const statusClassName = isSaving ? "rsvp-form__save-status--saving" : "rsvp-form__save-status--saved";
  const icon: React.ReactNode = isSaving ? <CircularProgress size="1em" color="inherit" /> : <CheckBoxIcon />;
  const text = isSaving ? t('RSVP-Data-Saving') : t('RSVP-Data-Saved');
  return (
    <>
      <span className={"rsvp-form__save-status " + statusClassName}>
        {icon}
        <span className="rsvp-save-status__text">{text}</span>
      </span>
    </>);
}

function AnswerBeforeDate({ date, isTooLate }: { date: Date, isTooLate: boolean }) {
  const { t } = useTranslation();
  const config = useContext(ConfigContext);
  const locale = GetLocale(config);
  const shortDate = Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
  const day = shortDate.format(date);
  const text = isTooLate ? t('Too-Late-To-Change-Answers', { date: day }) : t('Please-Answer-Before', { date: day });

  return (<div className="rsvp-header__answer-before">
    <div className="rsvp-answer-before__icon" />
    <span className="rsvp-answer-before__text">
      {text}
    </span>
  </div>);
}

export default function RSVPSection({ userData }: { userData: UserData }) {
  const TimeMsBetweenChangeAndSync = 1000;

  const { t } = useTranslation();

  const adminPreviewId = useRef(userData?.admin?.previewUserId);
  const isAdmin = userData?.admin != undefined;

  function getRelevantData(data: UserData): AttendeeData[] {
    return data?.attendees ? data.attendees.map(at => ({ ...at })) : ([]);
  }

  const [displayAttendees, setDisplayAttendees] = useState<AttendeeData[]>(getRelevantData(userData));
  // const formErrors = useRef({});

  // console.log(`displayAttendees: ${JSON.stringify(displayAttendees)}`);

  const queryClient = useQueryClient();
  const submitChangeMutation = useMutation({
    mutationFn: (changes: { attendees: AttendeeDataToSync[] }) => axios.patch('/api/user', changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get_user_data'] })
  });

  const currentPreviewId = userData?.admin?.previewUserId;
  const previewIdIsChanging = currentPreviewId !== adminPreviewId.current;

  function AttendeesHaveChanged() {
    for (let i = 0; i < userData.attendees.length; i++) {
      if (userData.attendees[i] !== displayAttendees[i]) {
        return true;
      }
    }
    return false;
  }

  function GetChangesToSync() {
    const changes: { attendees: AttendeeDataToSync[] } = { attendees: [] };
    if (AttendeesHaveChanged())
      changes.attendees = displayAttendees
        .map((d, i) => ({ d: d, u: userData.attendees[i] }))
        .map(({ d, u }) => Object.fromEntries(Object.entries(d).filter(([k, v]) => k === 'id' || v !== u[k as keyof AttendeeData]))) // only preserve id and stuff that changed
        .filter(d => Object.keys(d).length > 1 /* only id stayed */);
    return changes;
  }

  // unless component gets updated, schedule data sync
  useEffect(() => {
    function SyncIfNeeded() {
      if (previewIdIsChanging)
        return;

      if (userData.attendees.length !== displayAttendees.length) {
        const newData = getRelevantData(userData);
        setDisplayAttendees(newData);
      }

      const changes = GetChangesToSync();
      // console.log(`checking changes in displayAttendees: ${JSON.stringify(displayAttendees)}`);
      // console.log("Changes to sync: " + JSON.stringify(changes));
      if (Object.keys(changes.attendees).length > 0) {
        submitChangeMutation.mutate(changes);
      }
    }
    if (previewIdIsChanging) {
      const newData = getRelevantData(userData);
      // console.log('preview user has changed from ' + adminPreviewId.current + ' to ' + currentPreviewId + ` setDisplayAttendees(${JSON.stringify(newData)})`);
      adminPreviewId.current = currentPreviewId;
      setDisplayAttendees(newData);
      return;
    }

    const nextSyncTimeout = setTimeout(SyncIfNeeded, TimeMsBetweenChangeAndSync);
    return (() => { /*console.log('clearTimeout');*/ clearTimeout(nextSyncTimeout); })
  }, [displayAttendees, previewIdIsChanging, currentPreviewId, userData]);

  if (!displayAttendees) {
    // console.log('skip RSVP section');
    return null;
  }

  const needsSync = !previewIdIsChanging && Object.keys(GetChangesToSync().attendees).length > 0;
  const answerDate = new Date(userData?.rsvpLimitDate);

  const now = new Date();
  var tooLate = new Date(answerDate);
  tooLate.setDate(answerDate.getDate() + 1);
  const isTooLate = now >= tooLate;

  function onAttendeeChange<K extends keyof AttendeeData>(attendeeId: number, fieldName: K, value: AttendeeData[K]) {
    if (isTooLate && !isAdmin) {
      console.log("Ignoring changes to form: due date is passed.");
      return;
    }
    const index = displayAttendees.map(att => att.id).indexOf(attendeeId);
    if (index < 0 || index >= displayAttendees.length) {
      console.error(`Unexpected attendee id: ${attendeeId}, not found in ${JSON.stringify(displayAttendees)}`);
      return;
    }
    if (displayAttendees[index][fieldName] === value) {
      return;
    }
    var newData = displayAttendees.map(obj => ({ ...obj })); // deep copy array of attendees
    newData[index][fieldName] = value;
    setDisplayAttendees(newData);
  }

  return (
    <>
      <Section title={t('RSVP')} styleName='rsvp' startExpanded={!isTooLate} >
        <form className="rsvp__form">
          <AnswerBeforeDate date={answerDate} isTooLate={isTooLate} />
          <fieldset className="rsvp__form-content" disabled={isTooLate && !isAdmin}>
            {displayAttendees.length === 0 ? null :
              <>
                <div className="rsvp-form__attendees">
                  {displayAttendees.map((att, i) => <AttendeeFormLine key={i} attendee={att} handleChange={onAttendeeChange} />)}
                </div>
                {(isTooLate && !isAdmin) || <SaveStatus needsSync={needsSync} uploading={!!submitChangeMutation?.isPending} />}
              </>
            }
          </fieldset>
        </form>
      </Section >
    </>
  );
}
