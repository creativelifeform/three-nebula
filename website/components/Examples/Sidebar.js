import NextLink from 'next/link';
import React from 'react';
import { Sidebar as SidebarWrapper } from '../primitives/Sidebar';
import { exampleNames } from './constants';
import { useRouter } from 'next/router';

const formatLinkText = text => {
  if (text.includes('-')) {
    return text.split('-').join(' ');
  }

  return text;
};

const isActiveExample = (name, pathname) => pathname.includes(name);

export const Sidebar = () => {
  const { pathname } = useRouter();

  return (
    <SidebarWrapper>
      <header>Examples</header>
      <ul>
        {exampleNames.map(name => (
          <li key={name}>
            <NextLink href={`/examples/${name}`}>
              <a
                className={isActiveExample(name, pathname) ? 'active' : ''}
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
