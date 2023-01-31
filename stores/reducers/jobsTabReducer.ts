const jobsTabReducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        refresh: action?.payload?.refresh,
        jobs: action?.payload?.jobs,
        dataLoading: action?.payload?.dataLoading,
        currentTab: action?.payload?.currentTab,
        showUnverifiedEmailNotification: action?.payload?.showUnverifiedEmailNotification,
        limit: action?.payload?.limit,
        offset: action?.payload?.offset,
        totalJobs: action?.payload?.totalJobs,
        pricing_stats: {
          total_pricing_stats: {},
          plan_wise_pricing_stats: [],
        },
        open: action?.payload?.open,
        paused: action?.payload?.paused,
        closed: action?.payload?.closed,
        drafts: action?.payload?.drafts,
        unapproved: action?.payload?.unapproved,
        orgDataLoaded: action?.payload?.orgDataLoaded,
        orgId: action?.payload?.orgId,
        offices: action?.payload?.offices,
        managers: action?.payload?.managers,
        contactsUnlocksLeft: action?.payload?.contactsUnlocksLeft,
        orgHasNoJobs: action?.payload?.orgHasNoJobs,
      };
    case 'INITJOBSDATA':
      return {
        ...state,
        jobs: action?.payload?.jobs,
        dataLoading: action?.payload?.dataLoading,
        currentTab: action?.payload?.currentTab,
        totalJobs: action?.payload?.totalJobs,
        offset: action?.payload?.offset,
      };
    case 'UPDATEJOBSTABSTATE':
      return {
        ...state,
        ...action?.payload,
      };
    default:
      return state;
  }
};

export default jobsTabReducer;
