import './App.css';
import { DashboardState, bitable, dashboard } from "@lark-base-open/js-sdk";
import GoalConfig from './components/GoalConfig';
import Chart from './components/Chart';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hook';
import { ConfigPayload, loadConfig, refreshData, updatePreviewData } from './store/config';
import { useTheme } from './components/common';

let lastConfigChanged = ''
let lastDataChanged = ''

export default function App() {
  const dispatch = useAppDispatch()
  const config = useAppSelector(store => store.config.config)
  useTheme()

  const fetchInitData = useCallback(async() => {
    const configState = await dispatch<Promise<ConfigPayload>>(loadConfig())
    dispatch(refreshData(configState))
  }, [])

  useEffect(() => {
    if (dashboard.state === DashboardState.View || dashboard.state === DashboardState.FullScreen) {
      fetchInitData()

      dashboard.onConfigChange(async(e) => {
        // because multiple saveConfig are used to fetch bitable data with 2 conditions,
        // to avoid onConfigChange-onDataChange death loop, only react when
        // config and data really changes
        if (lastConfigChanged == JSON.stringify(e)) {
          return
        }
        lastConfigChanged = JSON.stringify(e)
        const configState = await dispatch<Promise<ConfigPayload>>(loadConfig())
        dispatch(refreshData(configState))
      })

      setTimeout(() => {
        // setRendered after 2 seconds, for bittable screenshot and push automation alerts.
        dashboard.setRendered();
    }, 2000);
    }  
    dashboard.onDataChange(e => {
      if (lastDataChanged == JSON.stringify(e)) {
        return
      }
      lastDataChanged = JSON.stringify(e)
      dispatch(refreshData({}))
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