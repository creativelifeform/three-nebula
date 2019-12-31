import { EXAMPLE_NAMES } from './constants';
import NextLink from 'next/link';
import React from 'react';
import { Sidebar as SidebarWrapper } from '../primitives/Sidebar';
import { useRouter } from 'next/router';

const formatLinkText = text => {
  if (text.includes('-')) {
    return text.replace('-', ' ');
  }

  return text;
};

const isActiveExample = (name, query) => name === query.name;

export const Sidebar = () => {
  const { query } = useRouter();

  return (
    <SidebarWrapper>
      <header>Examples</header>
      <ul>
        {EXAMPLE_NAMES.map(name => (
          <li key={name}>
            <NextLink href={`/examples/${name}`}>
              <a
                className={isActiveExample(name, query) ? 'active' : ''}
                href={`/examples/${name}`}
              >
                {formatLinkText(name)}
              </a>
            </NextLink>
          </li>
        ))}
      </ul>
    </SidebarWrapper>
  );
};
