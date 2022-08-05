/*
 * Copyright 2021 EPAM Systems
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

import ReactGA from 'react-ga';

export const provideEcGA = ({
  name,
  data,
  action,
  command = 'send',
  hitType = 'event',
  eventName = 'ecommerce',
  additionalData,
}) => {
  const ga = ReactGA.ga();

  if (Array.isArray(data)) {
    data.forEach((el) => {
      ga(`ec:${name}`, el);
    });
  } else {
    ga(`ec:${name}`, data);
  }
  if (additionalData) {
    ga('ec:setAction', action, additionalData);
  }
  ga(command, hitType, eventName, action);
};

export const normalizeDimensionValue = (value) => {
  return value !== undefined ? value.toString() : undefined;
};

export const normalizeEventString = (string = '') =>
  string
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
