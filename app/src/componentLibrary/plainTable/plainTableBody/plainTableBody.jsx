/*
 * Copyright 2023 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import { PlainTableRow } from '../plainTableRow';
import { columnPropTypes } from '../propTypes';

export const PlainTableBody = ({ data, columns, actions }) =>
  data.map((rowData) => (
    <PlainTableRow key={rowData.id} value={rowData} columns={columns} actions={actions} />
  ));
PlainTableBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      handler: PropTypes.func,
      id: PropTypes.number,
    }),
  ),
};
PlainTableBody.defaultProps = {
  actions: [],
};
