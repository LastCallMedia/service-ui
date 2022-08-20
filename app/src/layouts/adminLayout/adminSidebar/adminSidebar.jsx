/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import Link from 'redux-first-router-link';
import {
  PROJECT_LAUNCHES_PAGE,
  USER_PROFILE_PAGE,
  SERVER_SETTINGS_PAGE,
  PLUGINS_PAGE,
  ALL_USERS_PAGE,
  PROJECTS_PAGE,
} from 'controllers/pages/constants';
import { ALL } from 'common/constants/reservedFilterIds';
import PropTypes from 'prop-types';
import track, { useTracking } from 'react-tracking';
import { uiExtensionAdminSidebarComponentsSelector } from 'controllers/plugins/uiExtensions';
import { ADMIN_SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { Sidebar } from 'layouts/common/sidebar';
import { ExtensionLoader, extensionType } from 'components/extensionLoader';
import ProjectsIcon from './img/projects-inline.svg';
import UsersIcon from './img/all-users-inline.svg';
import SettingsIcon from './img/server-settings-inline.svg';
import PluginsIcon from './img/plugins-inline.svg';
import BackIcon from './img/back-inline.svg';
import ProfileIcon from './img/profile-inline.svg';
import styles from './adminSidebar.scss';

const cx = classNames.bind(styles);

const BackToProject = ({ activeProject }) => {
  const { trackEvent } = useTracking();
  return (
    <Link
      className={cx('back-to-project')}
      onClick={() => trackEvent(ADMIN_SIDEBAR_EVENTS.CLICK_BACK_TO_PROJECT_BTN)}
      to={{
        type: PROJECT_LAUNCHES_PAGE,
        payload: { projectId: activeProject, filterId: ALL },
      }}
    >
      <i className={cx('icon')}>{Parser(BackIcon)}</i>
    </Link>
  );
};
BackToProject.propTypes = {
  activeProject: PropTypes.string,
};
BackToProject.defaultProps = {
  activeProject: '',
};

const BackToProjectWithTooltip = withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    dynamicWidth: true,
    placement: 'right',
    tooltipTriggerClass: cx('tooltip-trigger'),
    dark: true,
  },
})(BackToProject);

@connect((state) => ({
  activeProject: activeProjectSelector(state),
  extensions: uiExtensionAdminSidebarComponentsSelector(state),
}))
@track()
export class AdminSidebar extends Component {
  static propTypes = {
    onClickNavBtn: PropTypes.func,
    activeProject: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    extensions: PropTypes.arrayOf(extensionType),
  };
  static defaultProps = {
    onClickNavBtn: () => {},
    extensions: [],
  };

  handleClickButton = (eventInfo) => () => {
    this.props.onClickNavBtn();
    if (eventInfo) {
      this.props.tracking.trackEvent(eventInfo);
    }
  };

  createTopSidebarItems = () => {
    const { onClickNavBtn, extensions } = this.props;

    const items = [
      {
        onClick: this.handleClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_PROJECTS_BTN),
        link: { type: PROJECTS_PAGE },
        icon: ProjectsIcon,
        message: <FormattedMessage id={'AdminSidebar.allProjects'} defaultMessage={'Projects'} />,
      },
      {
        onClick: this.handleClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_ALL_USERS_BTN),
        link: { type: ALL_USERS_PAGE },
        icon: UsersIcon,
        message: <FormattedMessage id={'AdminSidebar.allUsers'} defaultMessage={'All Users'} />,
      },
      {
        onClick: this.handleClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_SERVER_SETTINGS_BTN),
        link: { type: SERVER_SETTINGS_PAGE },
        icon: SettingsIcon,
        message: (
          <FormattedMessage id={'AdminSidebar.settings'} defaultMessage={'Server settings'} />
        ),
      },
      {
        onClick: this.handleClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_PLUGINS_BTN),
        link: { type: PLUGINS_PAGE },
        icon: PluginsIcon,
        message: <FormattedMessage id={'AdminSidebar.plugins'} defaultMessage={'Plugins'} />,
      },
    ];
    extensions.forEach((extension) =>
      items.push({
        name: extension.name,
        component: <ExtensionLoader extension={extension} />,
        onClick: onClickNavBtn,
      }),
    );

    return items;
  };

  createBottomSidebarItems = () => [
    {
      onClick: this.props.onClickNavBtn,
      link: {
        type: PROJECT_LAUNCHES_PAGE,
        payload: { projectId: this.props.activeProject, filterId: ALL },
      },
      icon: BackIcon,
      message: (
        <FormattedMessage id={'AdminSidebar.btnToProject'} defaultMessage={'Back to project'} />
      ),
    },
    {
      onClick: this.props.onClickNavBtn,
      link: { type: USER_PROFILE_PAGE },
      icon: ProfileIcon,
      message: <FormattedMessage id={'AdminSidebar.btnProfile'} defaultMessage={'Profile'} />,
    },
  ];

  render() {
    const { activeProject } = this.props;
    const topSidebarItems = this.createTopSidebarItems();
    const bottomSidebarItems = this.createBottomSidebarItems();
    const mainBlock = (
      <BackToProjectWithTooltip
        activeProject={activeProject}
        className={cx('back-to-project-tooltip')}
        tooltipContent={
          <FormattedMessage id={'AdminSidebar.btnToProject'} defaultMessage={'Back to project'} />
        }
        preventParsing
      />
    );

    return (
      <Sidebar
        mainBlock={mainBlock}
        topSidebarItems={topSidebarItems}
        bottomSidebarItems={bottomSidebarItems}
      />
    );
  }
}
