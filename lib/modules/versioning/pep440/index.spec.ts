import pep440 from '.';

describe('modules/versioning/pep440/index', () => {
  it.each`
    input                                            | expected
    ${'0.750'}                                       | ${true}
    ${'1.2.3'}                                       | ${true}
    ${'1.9'}                                         | ${true}
    ${'17.04.0'}                                     | ${true}
    ${'==1.2.3'}                                     | ${true}
    ${'==1.2.3.0'}                                   | ${true}
    ${'==1.2.3rc0'}                                  | ${true}
    ${'~=1.2.3'}                                     | ${true}
    ${'==1.2.*'}                                     | ${true}
    ${'>1.2.3'}                                      | ${true}
    ${'renovatebot/renovate'}                        | ${false}
    ${'renovatebot/renovate#master'}                 | ${false}
    ${'https://github.com/renovatebot/renovate.git'} | ${false}
  `('isValid("$input") === $expected', ({ input, expected }) => {
    const res = !!pep440.isValid(input);
    expect(res).toBe(expected);
  });

  it.each`
    input            | expected
    ${'1.2.3'}       | ${true}
    ${'1.2.3rc0'}    | ${false}
    ${'not_version'} | ${false}
  `('isStable("$input") === $expected', ({ input, expected }) => {
    expect(pep440.isStable(input)).toBe(expected);
  });

  it.each`
    a          | b             | expected
    ${'1.0'}   | ${'1.0.0'}    | ${true}
    ${'1.0.0'} | ${'1.0..foo'} | ${false}
  `('equals($a, $b) === $expected', ({ a, b, expected }) => {
    expect(pep440.equals(a, b)).toBe(expected);
  });

  it.each`
    a          | b             | expected
    ${'1.0'}   | ${'>=1.0.0'}  | ${true}
    ${'1.6.2'} | ${'<2.2.1.0'} | ${true}
    ${'>=3.8'} | ${'>=3.9'}    | ${false}
  `('matches($a, $b) === $expected', ({ a, b, expected }) => {
    expect(pep440.matches(a, b)).toBe(expected);
  });

  it.each`
    version       | isSingle
    ${'1.2.3'}    | ${true}
    ${'1.2.3rc0'} | ${true}
    ${'==1.2.3'}  | ${true}
    ${'==1.2'}    | ${true}
    ${'== 1.2.3'} | ${true}
    ${'==1.*'}    | ${false}
  `('isSingleVersion("$version") === $isSingle', ({ version, isSingle }) => {
    const res = !!pep440.isSingleVersion(version);
    expect(res).toBe(isSingle);
  });

  const versions = [
    '0.9.4',
    '1.0.0',
    '1.1.5',
    '1.2.1',
    '1.2.2',
    '1.2.3',
    '1.3.4',
    '2.0.3',
  ];

  it.each`
    range        | expected
    ${'~=1.2.1'} | ${'1.2.3'}
    ${'~=2.1'}   | ${null}
  `(
    'getSatisfyingVersion($versions, "$range") === $expected',
    ({ range, expected }) => {
      expect(pep440.getSatisfyingVersion(versions, range)).toBe(expected);
    },
  );

  it.each`
    range        | expected
    ${'~=1.2.1'} | ${'1.2.1'}
    ${'~=2.1'}   | ${null}
  `(
    'minSatisfyingVersion($versions, "$range") === $expected',
    ({ range, expected }) => {
      expect(pep440.minSatisfyingVersion(versions, range)).toBe(expected);
    },
  );

  it.each`
    currentValue            | rangeStrategy    | currentVersion | newVersion   | expected
    ${'1.0.0'}              | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'1.0.0'}              | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'1.0.0'}              | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'==1.0.3'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'==1.0.3'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'==1.0.3'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'>=1.2.0'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'>=1.2.3'}
    ${'>=1.2.0'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'>=1.2.0'}
    ${'>=1.2.0'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'~=1.2.0'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'~=1.2.3'}
    ${'~=1.2.0'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'~=1.2.0'}
    ${'~=1.2.0'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'~=1.0.3'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'~=1.2.3'}
    ${'~=1.0.3'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'~=1.2.3'}
    ${'~=1.0.3'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'==1.2.*'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.*'}
    ${'==1.2.*'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.*'}
    ${'==1.2.*'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'==1.0.*'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.*'}
    ${'==1.0.*'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.*'}
    ${'==1.0.*'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'<1.2.2.3'}           | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'<1.2.3.1'}
    ${'<1.2.2.3'}           | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'<1.2.3.1'}
    ${'<1.2.2.3'}           | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'<1.2.3'}             | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'<1.2.4'}
    ${'<1.2.3'}             | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'<1.2.4'}
    ${'<1.2.3'}             | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'<1.2'}               | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'<1.3'}
    ${'<1.2'}               | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'<1.3'}
    ${'<1.2'}               | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'<1'}                 | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'<2'}
    ${'<1'}                 | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'<2'}
    ${'<1'}                 | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'<2.0.0'}             | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'<2.0.0'}
    ${'<2.0.0'}             | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'<2.0.0'}
    ${'<2.0.0'}             | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'>0.9.8'}             | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'>0.9.8'}
    ${'>0.9.8'}             | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'>0.9.8'}
    ${'>0.9.8'}             | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'>2.0.0'}             | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'>=1.2.3'}
    ${'>2.0.0'}             | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'>=1.2.3'}
    ${'>2.0.0'}             | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'>=2.0.0'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'>=1.2.3'}
    ${'>=2.0.0'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'>=1.2.3'}
    ${'>=2.0.0'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'~=1.1.0, !=1.1.1'}   | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'~=1.2.3, !=1.1.1'}
    ${'~=1.1.0, !=1.1.1'}   | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'~=1.2.3, !=1.1.1'}
    ${'~=1.1.0, !=1.1.1'}   | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'~=1.1.0,!=1.1.1'}    | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'~=1.2.3,!=1.1.1'}
    ${'~=1.1.0,!=1.1.1'}    | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'~=1.2.3,!=1.1.1'}
    ${'~=1.1.0,!=1.1.1'}    | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${' '}                  | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${' '}
    ${' '}                  | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${' '}
    ${' '}                  | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'invalid'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${null}
    ${'invalid'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${null}
    ${'invalid'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'===1.0.3'}           | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${null}
    ${'===1.0.3'}           | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${null}
    ${'===1.0.3'}           | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'!=1.2.3'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${null}
    ${'!=1.2.3'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${null}
    ${'!=1.2.3'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'==1.2.3'}
    ${'~=1.1.0,!=1.1.1'}    | ${'unsupported'} | ${'1.0.0'}     | ${'1.2.3'}   | ${'~=1.2.3,!=1.1.1'}
    ${'>=19.12.2,<20.13.9'} | ${'replace'}     | ${'19.12.2'}   | ${'21.3.1'}  | ${'>=21.3.1,<22.0.0'}
    ${'>=19.12.2,<19.13.9'} | ${'replace'}     | ${'19.12.2'}   | ${'20.3.1'}  | ${'>=20.3.1,<20.4.0'}
    ${'>=19.12.2,<19.13.0'} | ${'replace'}     | ${'19.12.2'}   | ${'20.3.1'}  | ${'>=20.3.1,<20.4.0'}
    ${'>=19.12.2,<19.13.0'} | ${'replace'}     | ${'19.12.2'}   | ${'20.3.0'}  | ${'>=20.3.0,<20.4.0'}
    ${'>=19.12.2,<19.13.0'} | ${'replace'}     | ${'19.12.2'}   | ${'19.13.1'} | ${'>=19.13.1,<19.14.0'}
    ${'>=19.12.2,<19.13.0'} | ${'replace'}     | ${'19.12.2'}   | ${'19.13.0'} | ${'>=19.13.0,<19.14.0'}
    ${'>=19.12.2,<19.13.0'} | ${'auto'}        | ${'19.12.2'}   | ${'19.13.0'} | ${'>=19.13.0,<19.14.0'}
    ${'>=19.12.2,<20.13.9'} | ${'widen'}       | ${'19.12.2'}   | ${'21.3.1'}  | ${'>=19.12.2,<21.3.2'}
    ${'>=19.12.2,<19.13.9'} | ${'widen'}       | ${'19.12.2'}   | ${'20.3.1'}  | ${'>=19.12.2,<20.3.2'}
    ${'>=19.12.2,<19.13.0'} | ${'widen'}       | ${'19.12.2'}   | ${'20.3.1'}  | ${'>=19.12.2,<20.4.0'}
    ${'>=19.12.2,<19.13.0'} | ${'widen'}       | ${'19.12.2'}   | ${'20.3.0'}  | ${'>=19.12.2,<20.4.0'}
    ${'>=19.12.2,<19.13.0'} | ${'widen'}       | ${'19.12.2'}   | ${'19.13.1'} | ${'>=19.12.2,<19.14.0'}
    ${'>=19.12.2,<19.13.0'} | ${'widen'}       | ${'19.12.2'}   | ${'19.13.0'} | ${'>=19.12.2,<19.14.0'}
    ${'~=7.2'}              | ${'replace'}     | ${'7.2.0'}     | ${'8.0.1'}   | ${'~=8.0'}
    ${'~=7.2'}              | ${'replace'}     | ${'7.2.0'}     | ${'8'}       | ${'~=8.0'}
    ${'~=7.2.0'}            | ${'replace'}     | ${'7.2.0'}     | ${'8.2'}     | ${'~=8.2.0'}
    ${'~=7.2'}              | ${'widen'}       | ${'7.2.0'}     | ${'8.0.1'}   | ${'>=7.2,<9'}
    ${'~=7.2'}              | ${'widen'}       | ${'7.2.0'}     | ${'8'}       | ${'>=7.2,<9'}
    ${'~=7.2.0'}            | ${'widen'}       | ${'7.2.0'}     | ${'8.2'}     | ${'>=7.2.0,<8.3'}
    ${'==3.2.*,>=3.2.2'}    | ${'replace'}     | ${'3.2.2'}     | ${'4.1.1'}   | ${'==4.1.*'}
    ${'==3.2.*,>=3.2.2'}    | ${'replace'}     | ${'3.2.2'}     | ${'4.0.0'}   | ${'==4.0.*'}
    ${'>=1.0.0,<1.1.0'}     | ${'replace'}     | ${'1.0.0'}     | ${'1.2.0'}   | ${'>=1.2.0,<1.3.0'}
    ${'<1.3.0'}             | ${'bump'}        | ${'1.3.0'}     | ${'0.9.2'}   | ${'<1.3.0'}
    ${'<1.3.0'}             | ${'bump'}        | ${'0.9.0'}     | ${'0.9.2'}   | ${'<1.3.0'}
    ${'<=1.3.0'}            | ${'bump'}        | ${'0.9.0'}     | ${'0.9.2'}   | ${'<=1.3.0'}
    ${'<=1.3.0'}            | ${'bump'}        | ${'1.3.0'}     | ${'0.9.2'}   | ${'<=1.3.0'}
    ${'<1.3.0'}             | ${'bump'}        | ${'1.3.0'}     | ${'1.6.0'}   | ${'<1.6.1'}
    ${'<1.3.0'}             | ${'bump'}        | ${'0.9.0'}     | ${'1.6.0'}   | ${'<1.6.1'}
    ${'<=1.3.0'}            | ${'bump'}        | ${'0.9.0'}     | ${'1.6.0'}   | ${'<=1.6.0'}
    ${'<=1.3.0'}            | ${'bump'}        | ${'1.3.0'}     | ${'1.6.0'}   | ${'<=1.6.0'}
  `(
    'getNewValue("$currentValue", "$rangeStrategy", "$currentVersion", "$newVersion") === "$expected"',
    ({ currentValue, rangeStrategy, currentVersion, newVersion, expected }) => {
      const res = pep440.getNewValue({
        currentValue,
        rangeStrategy,
        currentVersion,
        newVersion,
      });
      expect(res).toEqual(expected);
    },
  );

  it.each`
    currentValue            | rangeStrategy    | currentVersion | newVersion   | expected
    ${'1.0.0'}              | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'1.0.0'}              | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'1.0.0'}              | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'==1.0.3'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'==1.0.3'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'==1.0.3'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>=1.2.0'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>=1.2.0'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.2.0'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.2.0'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>=1.2.0'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.2.0'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.0.3'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.0.3'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.0.3'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'==1.2.*'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'==1.2.*'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'==1.2.*'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'==1.0.*'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'==1.0.*'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'==1.0.*'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1.2.2.3'}           | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1.2.2.3'}           | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1.2.3'}             | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1.2.3'}             | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1.2.3'}             | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1.2'}               | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1.2'}               | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1.2'}               | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1'}                 | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1'}                 | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<1'}                 | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<2.0.0'}             | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<2.0.0'}             | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'<2.0.0'}             | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>0.9.8'}             | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>0.9.8'}             | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>0.9.8'}             | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>2.0.0'}             | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>2.0.0'}             | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>2.0.0'}             | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>=2.0.0'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>=2.0.0'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>=2.0.0'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.1.0, !=1.1.1'}   | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.1.0, !=1.1.1'}   | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.1.0, !=1.1.1'}   | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.1.0,!=1.1.1'}    | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.1.0,!=1.1.1'}    | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.1.0,!=1.1.1'}    | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${' '}                  | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${' '}                  | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${' '}                  | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'invalid'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'invalid'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'invalid'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'===1.0.3'}           | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'===1.0.3'}           | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'===1.0.3'}           | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'!=1.2.3'}            | ${'bump'}        | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'!=1.2.3'}            | ${'replace'}     | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'!=1.2.3'}            | ${'pin'}         | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'~=1.1.0,!=1.1.1'}    | ${'unsupported'} | ${'1.0.0'}     | ${'1.2.3'}   | ${'1.2.3'}
    ${'>=19.12.2,<20.13.9'} | ${'replace'}     | ${'19.12.2'}   | ${'21.3.1'}  | ${'21.3.1'}
    ${'>=19.12.2,<19.13.9'} | ${'replace'}     | ${'19.12.2'}   | ${'20.3.1'}  | ${'20.3.1'}
    ${'>=19.12.2,<19.13.0'} | ${'replace'}     | ${'19.12.2'}   | ${'20.3.1'}  | ${'20.3.1'}
    ${'>=19.12.2,<19.13.0'} | ${'replace'}     | ${'19.12.2'}   | ${'20.3.0'}  | ${'20.3.0'}
    ${'>=19.12.2,<19.13.0'} | ${'replace'}     | ${'19.12.2'}   | ${'19.13.1'} | ${'19.13.1'}
    ${'>=19.12.2,<19.13.0'} | ${'replace'}     | ${'19.12.2'}   | ${'19.13.0'} | ${'19.13.0'}
    ${'>=19.12.2,<19.13.0'} | ${'auto'}        | ${'19.12.2'}   | ${'19.13.0'} | ${'19.13.0'}
    ${'>=19.12.2,<20.13.9'} | ${'widen'}       | ${'19.12.2'}   | ${'21.3.1'}  | ${'21.3.1'}
    ${'>=19.12.2,<19.13.9'} | ${'widen'}       | ${'19.12.2'}   | ${'20.3.1'}  | ${'20.3.1'}
    ${'>=19.12.2,<19.13.0'} | ${'widen'}       | ${'19.12.2'}   | ${'20.3.1'}  | ${'20.3.1'}
    ${'>=19.12.2,<19.13.0'} | ${'widen'}       | ${'19.12.2'}   | ${'20.3.0'}  | ${'20.3.0'}
    ${'>=19.12.2,<19.13.0'} | ${'widen'}       | ${'19.12.2'}   | ${'19.13.1'} | ${'19.13.1'}
    ${'>=19.12.2,<19.13.0'} | ${'widen'}       | ${'19.12.2'}   | ${'19.13.0'} | ${'19.13.0'}
    ${'~=7.2'}              | ${'replace'}     | ${'7.2.0'}     | ${'8.0.1'}   | ${'8.0.1'}
    ${'~=7.2'}              | ${'replace'}     | ${'7.2.0'}     | ${'8'}       | ${'8'}
    ${'~=7.2.0'}            | ${'replace'}     | ${'7.2.0'}     | ${'8.2'}     | ${'8.2'}
    ${'~=7.2'}              | ${'widen'}       | ${'7.2.0'}     | ${'8.0.1'}   | ${'8.0.1'}
    ${'~=7.2'}              | ${'widen'}       | ${'7.2.0'}     | ${'8'}       | ${'8'}
    ${'~=7.2.0'}            | ${'widen'}       | ${'7.2.0'}     | ${'8.2'}     | ${'8.2'}
    ${'==3.2.*,>=3.2.2'}    | ${'replace'}     | ${'3.2.2'}     | ${'4.1.1'}   | ${'4.1.1'}
    ${'==3.2.*,>=3.2.2'}    | ${'replace'}     | ${'3.2.2'}     | ${'4.0.0'}   | ${'4.0.0'}
    ${'>=1.0.0,<1.1.0'}     | ${'replace'}     | ${'1.0.0'}     | ${'1.2.0'}   | ${'1.2.0'}
    ${'<1.3.0'}             | ${'bump'}        | ${'1.3.0'}     | ${'0.9.2'}   | ${'0.9.2'}
    ${'<1.3.0'}             | ${'bump'}        | ${'0.9.0'}     | ${'0.9.2'}   | ${'0.9.2'}
    ${'<=1.3.0'}            | ${'bump'}        | ${'0.9.0'}     | ${'0.9.2'}   | ${'0.9.2'}
    ${'<=1.3.0'}            | ${'bump'}        | ${'1.3.0'}     | ${'0.9.2'}   | ${'0.9.2'}
    ${'<1.3.0'}             | ${'bump'}        | ${'1.3.0'}     | ${'1.6.0'}   | ${'1.6.0'}
    ${'<1.3.0'}             | ${'bump'}        | ${'0.9.0'}     | ${'1.6.0'}   | ${'1.6.0'}
    ${'<=1.3.0'}            | ${'bump'}        | ${'0.9.0'}     | ${'1.6.0'}   | ${'1.6.0'}
    ${'<=1.3.0'}            | ${'bump'}        | ${'1.3.0'}     | ${'1.6.0'}   | ${'1.6.0'}
    ${'1.0.0'}              | ${'bump'}        | ${'1.0.0'}     | ${'==1.2.3'} | ${'==1.2.3'}
    ${'1.0.0'}              | ${'bump'}        | ${'1.0.0'}     | ${'>=1.2.3'} | ${'>=1.2.3'}
    ${'1.0.0'}              | ${'bump'}        | ${'1.0.0'}     | ${'<=1.2.3'} | ${'<=1.2.3'}
    ${'1.0.0'}              | ${'bump'}        | ${'1.0.0'}     | ${'~=1.2.3'} | ${'~=1.2.3'}
    ${'1.0.0'}              | ${'bump'}        | ${'1.0.0'}     | ${'!=1.2.3'} | ${'!=1.2.3'}
    ${'1.0.0'}              | ${'bump'}        | ${'1.0.0'}     | ${'>1.2.3'}  | ${'>1.2.3'}
    ${'1.0.0'}              | ${'bump'}        | ${'1.0.0'}     | ${'<1.2.3'}  | ${'<1.2.3'}
  `(
    'getNewValue("$currentValue", "$rangeStrategy", "$currentVersion", "$newVersion") === "$expected"',
    ({ currentValue, rangeStrategy, currentVersion, newVersion, expected }) => {
      const isReplacement = true;
      const res = pep440.getNewValue({
        currentValue,
        rangeStrategy,
        currentVersion,
        newVersion,
        isReplacement,
      });
      expect(res).toEqual(expected);
    },
  );

  it.each`
    version      | range                  | expected
    ${'0.9.9.9'} | ${'>= 1.0.0, < 2.0.0'} | ${true}
    ${'1.0.0a0'} | ${'>= 1.0.0, < 2.0.0'} | ${true}
    ${'1.0.0.0'} | ${'> 1.0.0, < 2.0.0'}  | ${true}
    ${'2.0.1.0'} | ${'> 1.0.0, < 2.0.0'}  | ${false}
    ${'2.0.0.0'} | ${'> 1.0.0, < 2.0.0'}  | ${false}
    ${'2.0.0a0'} | ${'> 1.0.0, < 2.0.0'}  | ${false}
    ${'1.2.2.9'} | ${'== 1.2.3'}          | ${true}
    ${'1.2.3a0'} | ${'== 1.2.3'}          | ${true}
    ${'1.2.3.0'} | ${'== 1.2.3'}          | ${false}
    ${'1.2.3.1'} | ${'== 1.2.3'}          | ${false}
    ${'1.2.4a0'} | ${'== 1.2.3'}          | ${false}
    ${'1.2.2.9'} | ${'!= 1.2.3'}          | ${false}
    ${'1.2.3.0'} | ${'!= 1.2.3'}          | ${false}
    ${'1.2.3.1'} | ${'!= 1.2.3'}          | ${false}
    ${'0.0.1'}   | ${'< 1.0.0'}           | ${false}
    ${'1.0.0'}   | ${'< 1.0.0'}           | ${false}
    ${'2.0.0'}   | ${'< 1.0.0'}           | ${false}
    ${'0.0.1'}   | ${'<= 1.0.0'}          | ${false}
    ${'1.0.0'}   | ${'<= 1.0.0'}          | ${false}
    ${'2.0.0'}   | ${'<= 1.0.0'}          | ${false}
    ${'0.0.1'}   | ${'< 1.0.0, > 2.0.0'}  | ${true}
    ${'3.0.0'}   | ${'< 1.0.0, > 2.0.0'}  | ${false}
  `(
    'isLessThanRange("$version", "$range") === "$expected"',
    ({ version, range, expected }) => {
      expect(pep440.isLessThanRange?.(version, range)).toBe(expected);
    },
  );
});
