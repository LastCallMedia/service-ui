/*
 * Copyright 2024 EPAM Systems
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

import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';
import { withModal } from 'controllers/modal';
import { ImportModalLayout } from 'pages/common/uploadFileControls/importModalLayout';
import { DropzoneComponent } from 'pages/common/uploadFileControls/dropzoneComponent';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { enabledImportPluginsSelector } from 'controllers/plugins';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import { ImportPluginSelector } from './pluginDropDownSelector';
import styles from './importLaunchModal.scss';

const cx = classNames.bind(styles);

const DEFAULT_PLUGIN_NAME = 'JUnit';

const messages = defineMessages({
  note: {
    id: 'ImportLaunchModal.note',
    defaultMessage: 'Note:',
  },
  modalTitle: {
    id: 'ImportLaunchModal.modalTitle',
    defaultMessage: 'Import Launch',
  },
  importButton: {
    id: 'ImportLaunchModal.importButton',
    defaultMessage: 'Import',
  },
  importTip: {
    id: 'ImportLaunchModal.tip',
    defaultMessage:
      'Drop <b>.xml</b> or <b>.zip</b> file under 32 MB to upload or <span>click</span> to add it',
  },
  incorrectFileSize: {
    id: 'ImportLaunchModal.incorrectFileSize',
    defaultMessage: 'File size is more than 32 Mb',
  },
  noteMessage: {
    id: 'ImportLaunchModal.noteMessage',
    defaultMessage:
      'If your runner does not write the test start time in the file, then the current server time will be used.',
  },
  importConfirmationWarning: {
    id: 'ImportLaunchModal.importConfirmationWarning',
    defaultMessage: 'Are you sure you want to interrupt import launches?',
  },
});

const ImportLaunchModal = ({ data, activeProject, importPlugins }) => {
  const { formatMessage } = useIntl();

  const [files, setFiles] = useState([]);
  const [selectedPluginData, setSelectedPluginData] = useState(
    () => importPlugins.find((plugin) => plugin.name === DEFAULT_PLUGIN_NAME) || importPlugins[0],
  );

  const selectPlugin = (name) =>
    setSelectedPluginData(importPlugins.find((plugin) => plugin.name === name));

  const url = URLS.pluginFileImport(activeProject, selectedPluginData.name);

  return (
    <ImportModalLayout
      data={data}
      files={files}
      setFiles={setFiles}
      title={formatMessage(messages.modalTitle)}
      importButton={formatMessage(messages.importButton)}
      url={url}
      eventsInfo={{
        okBtn: LAUNCHES_MODAL_EVENTS.OK_BTN_IMPORT_MODAL,
        cancelBtn: LAUNCHES_MODAL_EVENTS.CANCEL_BTN_IMPORT_MODAL,
        closeIcon: LAUNCHES_MODAL_EVENTS.CLOSE_ICON_IMPORT_MODAL,
      }}
      importConfirmationWarning={formatMessage(messages.importConfirmationWarning)}
    >
      <ImportPluginSelector
        selectedPluginData={selectedPluginData}
        importPlugins={importPlugins}
        selectPlugin={selectPlugin}
      />
      <DropzoneComponent
        data={data}
        files={files}
        setFiles={setFiles}
        maxFileSize={selectedPluginData.details?.maxFileSize}
        acceptFileMimeTypes={selectedPluginData.details?.acceptFileMimeTypes || []}
        incorrectFileSizeMessage={formatMessage(messages.incorrectFileSize)}
        tip={formatMessage(messages.importTip, {
          b: (d) => DOMPurify.sanitize(`<b>${d}</b>`),
          span: (d) => DOMPurify.sanitize(`<span>${d}</span>`),
        })}
      />
      <p className={cx('note-label')}>{formatMessage(messages.note)}</p>
      <p className={cx('note-message')}>{formatMessage(messages.noteMessage)}</p>
    </ImportModalLayout>
  );
};
ImportLaunchModal.propTypes = {
  data: PropTypes.object.isRequired,
  activeProject: PropTypes.string,
  importPlugins: PropTypes.arrayOf(PropTypes.object).isRequired,
};
ImportLaunchModal.defaultProps = {
  activeProject: '',
};
export default withModal('importLaunchModal')(
  connect((state) => ({
    activeProject: activeProjectSelector(state),
    importPlugins: enabledImportPluginsSelector(state),
  }))(ImportLaunchModal),
);
