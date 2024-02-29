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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Component } from 'react';
import PropTypes from 'prop-types';

export class ErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    getFallback: PropTypes.func,
  };
  static defaultProps = {
    getFallback: null,
  };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  state = {
    hasError: false,
    error: null,
  };

  render() {
    const { children, getFallback } = this.props;
    const { hasError, error } = this.state;
    if (!hasError) {
      return children;
    }
    // eslint-disable-next-line no-console
    console.error(error);
    return getFallback ? getFallback(error) : null;
  }
}
