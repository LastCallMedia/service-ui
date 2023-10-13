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

import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Dropdown } from 'componentLibrary/dropdown';
import { COMMON_LOCALE_KEYS, months } from 'common/constants/localization';
import styles from './datePickerHeader.scss';
import DatePickerHeaderIcon from './img/calendar-arrow-inline.svg';

const cx = classNames.bind(styles);

const getYearsFrom = (start, amountYearsToGenerate = 20) => {
  const yearsFromCurrent = start + amountYearsToGenerate;
  return new Array(yearsFromCurrent - start).fill().map((_, i) => start - i);
};

export const DatePickerHeader = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  headerNodes,
  customClassName,
}) => {
  const { formatMessage } = useIntl();
  const year = date.getFullYear();
  const month = date.getMonth();

  const monthDropdownOptions = useMemo(
    () =>
      months.reduce((acc, monthValue, monthNumber) => {
        return acc.concat({
          value: monthNumber,
          label: formatMessage(COMMON_LOCALE_KEYS[monthValue]),
        });
      }, []),
    [],
  );

  const yearDropdownOptions = useMemo(() => {
    const yearValues = getYearsFrom(year);
    return yearValues.reduce(
      (acc, yearValue) => acc.concat({ value: yearValue, label: yearValue }),
      [],
    );
  }, []);

  const displayedYear = yearDropdownOptions.find(({ value }) => value === year);

  const displayedMonth = monthDropdownOptions[month];

  return (
    <>
      {headerNodes ? <div className={cx(customClassName)}>{headerNodes}</div> : null}
      <div className={cx('header')}>
        <i
          aria-label="Previous Months"
          onClick={prevMonthButtonDisabled ? null : decreaseMonth}
          className={cx('icon-prev', { disabled: prevMonthButtonDisabled })}
        >
          {Parser(DatePickerHeaderIcon)}
        </i>
        <div className={cx('dropdowns-wrapper')}>
          <Dropdown
            options={monthDropdownOptions}
            value={displayedMonth}
            onChange={changeMonth}
            transparentBackground
            className={cx('dropdown')}
            toggleButtonClassName={cx('toggle-button')}
            defaultWidth={false}
          />
          <Dropdown
            options={yearDropdownOptions}
            value={displayedYear}
            onChange={changeYear}
            transparentBackground
            className={cx('dropdown')}
            toggleButtonClassName={cx('toggle-button')}
            defaultWidth={false}
          />
        </div>
        <i
          aria-label="Next Months"
          onClick={nextMonthButtonDisabled ? null : increaseMonth}
          className={cx('icon-next', { disabled: nextMonthButtonDisabled })}
        >
          {Parser(DatePickerHeaderIcon)}
        </i>
      </div>
    </>
  );
};
DatePickerHeader.propTypes = {
  changeYear: PropTypes.func,
  changeMonth: PropTypes.func,
  decreaseMonth: PropTypes.func,
  increaseMonth: PropTypes.func,
  headerNodes: PropTypes.node,
  date: PropTypes.instanceOf(Date),
  prevMonthButtonDisabled: PropTypes.bool,
  nextMonthButtonDisabled: PropTypes.bool,
  customClassName: PropTypes.string,
};
DatePickerHeader.defaultProps = {
  date: new Date(),
  prevMonthButtonDisabled: false,
  nextMonthButtonDisabled: false,
  changeYear: () => {},
  changeMonth: () => {},
  decreaseMonth: () => {},
  increaseMonth: () => {},
  headerNodes: null,
  customClassName: '',
};
