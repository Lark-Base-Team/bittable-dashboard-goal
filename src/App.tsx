import './App.css';
import { DashboardState, bitable, dashboard } from "@lark-base-open/js-sdk";
import GoalConfig from './components/GoalConfig';
import Chart from './components/Chart';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from './store/hook';
import { ConfigPayload, loadConfig } from './store/config';
import { loadChartData, setCurrentValueFromIData } from './store/chartData';
import { useTheme } from './components/common';

export default function App() {
  const dispatch = useAppDispatch()
  useTheme()

  const fetchInitData = useCallback(async() => {
    dispatch(loadConfig())
    dispatch(loadChartData())
  }, [])

  useEffect(() => {
    if (dashboard.state === DashboardState.View || dashboard.state === DashboardState.FullScreen) {
      fetchInitData()

      dashboard.onConfigChange(e => {
        dispatch(loadConfig())
      })

      setTimeout(() => {
        // 预留3s给浏览器进行渲染，3s后告知服务端可以进行截图了
        dashboard.setRendered();
    }, 2000);
    }  
    dashboard.onDataChange(e => {
      dispatch(setCurrentValueFromIData(e.data))
    })
  }, [])

  
  return (
    <div className='goal-app'>
        <div className='goal-chart'>
          <Chart/>
        </div>
        {dashboard.state === DashboardState.Config || dashboard.state === DashboardState.Create ? (
          <div className='config-panel'>
            <GoalConfig/>
          </div>
            
        ) : null}
    </div>
  );
}