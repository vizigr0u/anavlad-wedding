import { useTranslation } from "react-i18next";
import usePrivateTranslation from "../hooks/UsePrivateTranslation";
import { AttendeeData } from "../types";
import { useContext } from "react";
import { ConfigContext } from "../AppConfigContext";

function FoodChoice({ handleChange, defaultChoice }: { handleChange: (key: keyof AttendeeData, value: string) => void, defaultChoice: string }) {
  const { t } = usePrivateTranslation();
  const config = useContext(ConfigContext);

  return (<select onChange={evt => handleChange("foodPreferences", evt.target.value)} className="rsvp-select rsvp-question__answers" value={defaultChoice ?? ""} >
    <option hidden disabled value="" className="rsvp-select__item" >{t('Choose-Food-Option')}</option>
    {config.foodMenu.map((key, index) =>
      <option key={index} value={key.class} className="rsvp-select__item">{t(key.translationKey)}</option>)}
  </select>
  );
}

export function AttendeeFormLine({ attendee, handleChange }: { attendee: AttendeeData, handleChange: (attendeeId: number, fieldName: keyof AttendeeData, value: string) => void }) {
  const { t } = useTranslation();

  const answerYes = attendee.rsvpAnswer === 1;
  const answerNo = attendee.rsvpAnswer === 0;

  function onChange(key: keyof AttendeeData, value: string) {
    if (handleChange)
      handleChange(attendee.id, key, value);
  }

  function onSetRsvpAnswer(answer: number) {
    if (handleChange)
      handleChange(attendee.id, 'rsvpAnswer', answer.toString());
  }

  return (
    <div className="rsvp-attendee-form">
      <input
        className="rsvp-text-input rsvp-name__input"
        type="text"
        placeholder={t('Guest-Name')}
        value={attendee?.name ?? ""}
        onChange={evt => onChange("name", evt.target.value)} />
      <div className="rsvp-section">
        <span className="rsvp-question">{t('Attendee-Form-Will-Be-Attending-Question')}</span>
        <div className="rsvp-question__answers">
          <label className="rsvp-question__answer-label">
            <input className="rsvp-question__answer-checkbox" type="checkbox" checked={answerYes} onChange={() => onSetRsvpAnswer(1)} />
            {t('Yes')}
          </label>
          <label className="rsvp-question__answer-label">
            <input className="rsvp-question__answer-checkbox" type="checkbox" checked={answerNo} onChange={() => onSetRsvpAnswer(0)} />
            {t('No')}
          </label>
        </div>
      </div>
      <div className="rsvp-section">
        <span className="rsvp-question">{t('Attendee-Form-Food-Preference')}</span>
        {<FoodChoice defaultChoice={attendee?.foodPreferences ?? ''} handleChange={onChange} />}
      </div>
      <textarea
        className="rsvp-text-input rsvp-comment__input"
        itemType="text"
        placeholder={t('Attendee-Form-Comment-Placeholder')}
        value={attendee?.comment ?? ""}
        onChange={evt => onChange("comment", evt.target.value)} />
    </div>
  );
}
