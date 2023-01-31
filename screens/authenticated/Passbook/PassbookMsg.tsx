/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import Typography from 'antd/lib/typography';

const { Text } = Typography;
interface StateInterface{
  msgDisplay:boolean
}
// eslint-disable-next-line consistent-return
const getTimeRemaining = (endtime:any) :any => {
  let timeLeft = {} as any;
  const difference = endtime.diff(dayjs(new Date()));
  if (difference > 0) {
    timeLeft = {
      // days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      h: Math.floor((difference / (1000 * 60 * 60))),
      m: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
    return timeLeft;
  }
};
interface propsI{
  create:string
}
const PassbookMsg = (props:propsI):JSX.Element => {
  const [timer, setTimer] = useState() as any;
  const [timeLeft, setTimeLeft] = useState(60) as any;
  const timerComponents = [] as any;
  const [state, setState] = useState<StateInterface>({
    msgDisplay: false,
  });
  const avalibaleForMsg = ():void => {
    const appCreatedDate = dayjs(props.create);
    const currentDate = dayjs(new Date());
    const dateTillFree = appCreatedDate.add(7, 'day');
    const diff = dayjs(dateTillFree).diff(currentDate, 'day');
    if (diff > 0) {
      setState((prevState) => ({
        ...prevState,
        msgDisplay: true,

      }));
      setTimer(dateTillFree);
    } else {
      setTimer(0);
      setState((prevState) => ({
        ...prevState,
        msgDisplay: false,
      }));
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { avalibaleForMsg(); }, []);
  React.useEffect(() => {
    setTimeout(() => {
      if (timer) { setTimeLeft(getTimeRemaining(timer)); }
    }, 1000);
  });
  Object.keys(timeLeft).forEach((interval) => {
    if (timeLeft[interval] === -1) {
      return;
    }

    timerComponents.push(
      timeLeft[interval],
    );
  });

  return (
    <>
      {state.msgDisplay ? <Text className="passbook-msg-display"> Your invoice is being processed. It will soon be sent on your verified email</Text> : ''}

    </>
  );
};
export default PassbookMsg;
