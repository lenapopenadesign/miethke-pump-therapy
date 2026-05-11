import { useNavigate } from '../navigation';
import { useTherapy, fmtTime, parseTime, hourlyUg, morphineMgDay, bupivacaineMgDay } from '../therapy';

const imgEbene1 = "/icons/0e3066d4-f803-4f37-8c9a-74477a140254.svg";

// Step 1 — when
export function AddIntervalSheetWhen() {
  const navigate = useNavigate();
  const { draft, setDraft, intervals, editingId, removeInterval } = useTherapy();
  const lengthMin = Math.max(0, draft.endMin - draft.startMin);
  const lengthH = Math.floor(lengthMin / 60);
  const lengthM = lengthMin % 60;
  const pctDay = ((lengthMin / 1440) * 100).toFixed(1);
  const cancelTarget = intervals.length > 0 ? 'intervals-populated' : 'intervals-empty';
  const onDelete = () => {
    if (!editingId) return;
    removeInterval(editingId);
    navigate(intervals.length > 1 ? 'intervals-populated' : 'intervals-empty');
  };
  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#0d0d1a] h-[1920px] left-0 top-0 w-[1200px]" />
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <div className="absolute bg-white h-[1340px] left-0 overflow-clip rounded-tl-[32px] rounded-tr-[32px] top-[480px] w-[1200px]">
        <div className="absolute bg-[#d9dbde] h-[6px] left-[560px] rounded-[3px] top-[24px] w-[80px]" />
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[40px] top-[64px] whitespace-nowrap">
          Add interval
        </p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[80px] not-italic text-[#667380] text-[22px] top-[124px] w-[1040px]">
          Step 1 of 2 — when does it apply?
        </p>
        <div className="absolute bg-[#0b7fa8] h-[6px] left-[80px] rounded-[3px] top-[170px] w-[516px]" />
        <div className="absolute bg-[#d9dbde] h-[6px] left-[604px] rounded-[3px] top-[170px] w-[516px]" />
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[22px] top-[220px] whitespace-nowrap">
          Label
        </p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[200px] not-italic text-[#9ea8b2] text-[18px] top-[224px] whitespace-nowrap">
          Optional but recommended
        </p>
        <div className="absolute bg-white border border-[#d9dbde] border-solid h-[80px] left-[80px] rounded-[12px] top-[256px] w-[1040px]" />
        <input
          type="text"
          value={draft.label}
          onChange={e => setDraft({ ...draft, label: e.target.value })}
          className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[100px] not-italic text-[#063b66] text-[28px] top-[280px] whitespace-nowrap bg-transparent outline-none border-0 p-0 w-[1000px]"
        />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[80px] not-italic text-[#9ea8b2] text-[16px] top-[350px] whitespace-nowrap">{`e.g. "Morning peak", "Physio", "Wind-down"`}</p>
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[22px] top-[400px] whitespace-nowrap">
          Time window
        </p>
        <div className="absolute bg-white border border-[#d9dbde] border-solid h-[90px] left-[80px] rounded-[12px] top-[436px] w-[500px]" />
        <input
          type="time"
          value={fmtTime(draft.startMin)}
          onChange={e => setDraft({ ...draft, startMin: parseTime(e.target.value) })}
          className="absolute font-bold not-italic leading-[normal] left-[100px] text-[#063b66] text-[32px] top-[460px] whitespace-nowrap bg-transparent outline-none border-0 p-0 w-[200px]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        <div
          onClick={() => setDraft({ ...draft, startMin: Math.max(0, draft.startMin - 15) })}
          className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid rounded-[8px] cursor-pointer select-none flex items-center justify-center"
          style={{ left: 410, top: 451, width: 36, height: 60 }}
        >
          <p className="font-bold text-[#063b66] text-[24px] not-italic">−</p>
        </div>
        <div
          onClick={() => setDraft({ ...draft, startMin: Math.min(1440, draft.startMin + 15) })}
          className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid rounded-[8px] cursor-pointer select-none flex items-center justify-center"
          style={{ left: 454, top: 451, width: 36, height: 60 }}
        >
          <p className="font-bold text-[#063b66] text-[24px] not-italic">+</p>
        </div>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[100px] not-italic text-[#667380] text-[16px] top-[498px] whitespace-nowrap">
          Start
        </p>
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[600px] not-italic text-[#667380] text-[32px] top-[460px] whitespace-nowrap">
          →
        </p>
        <div className="absolute bg-white border border-[#d9dbde] border-solid h-[90px] left-[640px] rounded-[12px] top-[436px] w-[480px]" />
        <input
          type="time"
          value={fmtTime(draft.endMin)}
          onChange={e => setDraft({ ...draft, endMin: parseTime(e.target.value) })}
          className="absolute font-bold not-italic leading-[normal] left-[660px] text-[#063b66] text-[32px] top-[460px] whitespace-nowrap bg-transparent outline-none border-0 p-0 w-[200px]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        <div
          onClick={() => setDraft({ ...draft, endMin: Math.max(0, draft.endMin - 15) })}
          className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid rounded-[8px] cursor-pointer select-none flex items-center justify-center"
          style={{ left: 950, top: 451, width: 36, height: 60 }}
        >
          <p className="font-bold text-[#063b66] text-[24px] not-italic">−</p>
        </div>
        <div
          onClick={() => setDraft({ ...draft, endMin: Math.min(1440, draft.endMin + 15) })}
          className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid rounded-[8px] cursor-pointer select-none flex items-center justify-center"
          style={{ left: 994, top: 451, width: 36, height: 60 }}
        >
          <p className="font-bold text-[#063b66] text-[24px] not-italic">+</p>
        </div>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[660px] not-italic text-[#667380] text-[16px] top-[498px] whitespace-nowrap">
          End
        </p>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[normal] left-[80px] not-italic text-[#667380] text-[18px] top-[540px] whitespace-pre">{`Length: ${lengthH}h ${lengthM}m  ·  ${pctDay}% of the day`}</p>
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[22px] top-[600px] whitespace-nowrap">
          Apply to
        </p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[220px] not-italic text-[#9ea8b2] text-[18px] top-[604px] whitespace-nowrap">
          within the Weekdays group
        </p>
        {[
          { left: 80, label: 'M', textLeft: 23 },
          { left: 166, label: 'T', textLeft: 26 },
          { left: 252, label: 'W', textLeft: 21.5 },
          { left: 338, label: 'T', textLeft: 26 },
          { left: 424, label: 'F', textLeft: 27 },
        ].map(d => (
          <div key={d.left} className="absolute bg-[#0b7fa8] overflow-clip rounded-[35px] size-[70px] top-[640px]" style={{ left: d.left }}>
            <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic text-[26px] text-white top-[19.5px] whitespace-nowrap" style={{ left: d.textLeft }}>
              {d.label}
            </p>
          </div>
        ))}
        <div className="absolute bg-[#d9dbde] h-px left-[80px] top-[760px] w-[1040px]" />
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[22px] top-[790px] whitespace-nowrap">
          Schedule preview
        </p>
        <div className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid h-[90px] left-[80px] rounded-[8px] top-[830px] w-[1040px]" />
        {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
          <p key={t} className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[#9ea8b2] text-[12px] top-[836px] whitespace-nowrap"
             style={{ left: [75, 329, 584, 838, 1091][i] }}>
            {t}
          </p>
        ))}
        <div className="absolute bg-[#9ea8b2] h-[2px] left-[92px] top-[890px] w-[1016px]" />
        <div className="absolute bg-[#8cc7e8] h-[26px] left-[92px] rounded-[3px] top-[884px] w-[336.243px]" />
        <div className="absolute bg-[#0b7fa8] h-[26px] left-[536.5px] rounded-[3px] top-[884px] w-[251.577px]" />
        <div className="absolute bg-[#0b7fa8] h-[26px] left-[790.5px] rounded-[3px] top-[884px] w-[188.077px]" />
        <div className="absolute bg-[#4da6d6] h-[26px] left-[981px] rounded-[3px] top-[884px] w-[124.577px]" />
        <div className="absolute bg-[#d9ebf5] border-2 border-[#0b7fa8] border-dashed h-[38px] left-[430.67px] rounded-[3px] top-[854px] w-[103.41px]" />
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[434.67px] not-italic text-[#065879] text-[14px] top-[860px] whitespace-nowrap">
          NEW
        </p>
        <div className="absolute left-[80px] overflow-clip size-[28px] top-[962px]">
          <div className="-translate-x-1/2 absolute aspect-[159.24000549316406/159.24000549316406] bottom-0 left-[calc(50%+0.5px)] overflow-clip top-0">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEbene1} />
          </div>
        </div>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[120px] not-italic text-[#667380] text-[22px] top-[960px] w-[1000px]">{`No overlap with existing intervals on Weekdays. You'll set the dose on the next step.`}</p>
        {editingId && (
          <div
            onClick={onDelete}
            className="absolute bg-white border-2 border-[#c44539] border-solid h-[90px] left-[80px] overflow-clip rounded-[45px] top-[1210px] w-[220px] cursor-pointer flex items-center justify-center"
          >
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold not-italic text-[#c44539] text-[24px] whitespace-nowrap">
              Delete
            </p>
          </div>
        )}
        <div
          onClick={() => navigate(cancelTarget)}
          className={`absolute bg-white border-2 border-[#0b7fa8] border-solid h-[90px] overflow-clip rounded-[45px] top-[1210px] cursor-pointer ${editingId ? 'left-[240px] w-[340px]' : 'left-[80px] w-[500px]'}`}
        >
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic text-[#0b7fa8] text-[28px] top-[26px] whitespace-nowrap"
             style={{ left: editingId ? 120 : 200.5 }}>
            Cancel
          </p>
        </div>
        <div onClick={() => navigate('add-interval-dose')} className="absolute bg-[#0b7fa8] h-[90px] left-[600px] overflow-clip rounded-[45px] top-[1210px] w-[520px] cursor-pointer">
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[145.5px] not-italic text-[28px] text-white top-[28px] whitespace-nowrap">
            Next: set dose →
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 2 — dose
export function AddIntervalSheetDose() {
  const navigate = useNavigate();
  const { draft, setDraft, baseDose, editingId, commitDraft } = useTherapy();
  const stepDown = () => setDraft({ ...draft, dose: Math.max(0, draft.dose - 10) });
  const stepUp = () => setDraft({ ...draft, dose: Math.min(2000, draft.dose + 10) });
  const hourly = hourlyUg(draft.dose);
  const delta = draft.dose - baseDose;
  const pct = baseDose > 0 ? Math.round((delta / baseDose) * 100) : 0;
  const deltaSign = delta >= 0 ? '↑' : '↓';
  const morMgD = morphineMgDay(draft.dose);
  const morMgH = morMgD / 24;
  const bupMgD = bupivacaineMgDay(draft.dose);
  const bupMgH = bupMgD / 24;
  const save = () => { commitDraft(); navigate('intervals-populated'); };
  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#0d0d1a] h-[1920px] left-0 top-0 w-[1200px]" />
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <div className="absolute bg-white h-[1340px] left-0 overflow-clip rounded-tl-[32px] rounded-tr-[32px] top-[480px] w-[1200px]">
        <div className="absolute bg-[#d9dbde] h-[6px] left-[560px] rounded-[3px] top-[24px] w-[80px]" />
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[40px] top-[64px] whitespace-nowrap">
          Add interval
        </p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[80px] not-italic text-[#667380] text-[22px] top-[124px] w-[1040px]">
          Step 2 of 2 — what dose?
        </p>
        <div className="absolute bg-[#0b7fa8] h-[6px] left-[80px] rounded-[3px] top-[170px] w-[516px]" />
        <div className="absolute bg-[#0b7fa8] h-[6px] left-[604px] rounded-[3px] top-[170px] w-[516px]" />
        <div className="absolute bg-[#ddf1f6] font-['Inter:Semi_Bold',sans-serif] font-semibold h-[70px] leading-[normal] left-[80px] not-italic overflow-clip rounded-[12px] top-[220px] w-[1040px]">
          <p className="absolute left-[24px] text-[#063b66] text-[22px] top-[22px] whitespace-pre">{`"${draft.label}"  ·  Mon–Fri  ·  ${fmtTime(draft.startMin)} → ${fmtTime(draft.endMin)}`}</p>
          <p onClick={() => navigate('add-interval-when')} className="absolute left-[980px] text-[#0b7fa8] text-[20px] top-[24px] whitespace-nowrap cursor-pointer">
            Edit
          </p>
        </div>
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[30px] top-[320px] whitespace-nowrap">
          Set the interval dose
        </p>
        <div onClick={() => navigate('add-interval-when')} className="absolute bg-white border-2 border-[#0b7fa8] border-solid h-[90px] left-[80px] overflow-clip rounded-[45px] top-[1210px] w-[500px] cursor-pointer">
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[197.5px] not-italic text-[#0b7fa8] text-[28px] top-[26px] whitespace-nowrap">
            ← Back
          </p>
        </div>
        <div onClick={save} className="absolute bg-[#0b7fa8] h-[90px] left-[600px] overflow-clip rounded-[45px] top-[1210px] w-[520px] cursor-pointer">
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[177.5px] not-italic text-[28px] text-white top-[28px] whitespace-nowrap">
            {editingId ? 'Save interval' : 'Add interval'}
          </p>
        </div>
        <div className="-translate-y-full absolute flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-end leading-[0] left-[692px] text-[#9ea8b2] text-[20px] top-[399px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[24px]">Daily dose</p>
        </div>
        <div className="-translate-y-full absolute flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-end leading-[0] left-[979px] text-[#9ea8b2] text-[20px] top-[399px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          <p className="leading-[24px]">Hourly dose</p>
        </div>
        <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-[84px] top-[407px] w-[1040px]">
          <div className="bg-white border-2 border-[#0b7fa8] border-solid content-start flex flex-wrap gap-[16px_366px] items-start overflow-clip px-[24px] py-[20px] relative rounded-[16px] shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[8px] items-start opacity-80 relative shrink-0">
              <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#063b66] text-[28px] whitespace-nowrap">
                Baclofen
              </p>
              <div className="bg-[#0b7fa8] h-[28px] overflow-clip relative rounded-[14px] shrink-0 w-[96px]">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[15.5px] not-italic text-[14px] text-white top-[5.5px] whitespace-nowrap">
                  PRIMARY
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[20px] items-center relative shrink-0">
              <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                <div onClick={stepDown} className="bg-[#f7fafc] border border-[#d9dbde] border-solid overflow-clip relative rounded-[12px] shrink-0 size-[60px] cursor-pointer select-none">
                  <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[16px] not-italic text-[#063b66] text-[36px] top-[7px] whitespace-nowrap">
                    −
                  </p>
                </div>
                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                  <div className="bg-white border-2 border-[#0b7fa8] border-solid col-1 h-[60px] ml-0 mt-0 relative rounded-[12px] row-1 w-[200px]" />
                  <div className="col-1 content-stretch flex gap-[21px] items-center leading-[normal] ml-[26px] mt-[8px] not-italic relative row-1 whitespace-nowrap">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={draft.dose}
                      onChange={e => {
                        const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                        setDraft({ ...draft, dose: Math.max(0, Math.min(2000, n)) });
                      }}
                      className="font-bold not-italic text-[#063b66] text-[36px] bg-transparent outline-none border-0 p-0 w-[80px] text-left"
                      style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'normal' }}
                    />
                    <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#667380] text-[16px]">
                      µg/day
                    </p>
                  </div>
                </div>
                <div onClick={stepUp} className="bg-[#f7fafc] border border-[#d9dbde] border-solid overflow-clip relative rounded-[12px] shrink-0 size-[60px] cursor-pointer select-none">
                  <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[20px] not-italic text-[#063b66] text-[32px] top-[7px] whitespace-nowrap">
                    +
                  </p>
                </div>
              </div>
              <div className="content-stretch flex gap-[20px] items-center leading-[normal] not-italic relative shrink-0 whitespace-nowrap">
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#0b7fa8] text-[24px]">
                  ≈ {hourly.toFixed(1)}
                </p>
                <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#9ea8b2] text-[16px]">
                  µg/h
                </p>
              </div>
            </div>
            <div className="bg-[rgba(252,227,160,0.29)] flex-[1_0_0] h-[60px] min-w-px overflow-clip relative rounded-[12px]">
              <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[24px] not-italic text-[#b3850e] text-[22px] top-[16px] whitespace-pre">{`${deltaSign} ${delta >= 0 ? '+' : ''}${delta} µg/day ${delta >= 0 ? 'above' : 'below'} base (${baseDose} → ${draft.dose})  ·  ${pct >= 0 ? '+' : ''}${pct}%`}</p>
            </div>
          </div>
          <div className="bg-white border border-[#d9dbde] border-solid h-[88px] leading-[normal] not-italic overflow-clip relative rounded-[16px] shrink-0 w-full whitespace-nowrap">
            <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[23px] text-[#063b66] text-[24px] top-[15px]">
              Morphine
            </p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[23px] text-[#9ea8b2] text-[16px] top-[49px]">
              calculated · 0.139% of Baclofen
            </p>
            <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[599px] text-[#667380] text-[26px] top-[26px]">
              {morMgD.toFixed(2)}
            </p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[669px] text-[#9ea8b2] text-[18px] top-[34px]">
              mg/day
            </p>
            <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[897px] text-[#667380] text-[22px] top-[28px]">
              {morMgH.toFixed(3)}
            </p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[966px] text-[#9ea8b2] text-[16px] top-[34px]">
              mg/h
            </p>
          </div>
          <div className="bg-white border border-[#d9dbde] border-solid h-[88px] leading-[normal] not-italic overflow-clip relative rounded-[16px] shrink-0 w-full whitespace-nowrap">
            <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[23px] text-[#063b66] text-[24px] top-[15px]">
              Bupivacaine
            </p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[23px] text-[#9ea8b2] text-[16px] top-[49px]">
              calculated · 0.417% of Baclofen
            </p>
            <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[605px] text-[#667380] text-[26px] top-[26px]">
              {bupMgD.toFixed(2)}
            </p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[669px] text-[#9ea8b2] text-[18px] top-[34px]">
              mg/day
            </p>
            <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[894px] text-[#667380] text-[22px] top-[22px]">
              {bupMgH.toFixed(3)}
            </p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[968px] text-[#9ea8b2] text-[16px] top-[28px]">
              mg/h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
