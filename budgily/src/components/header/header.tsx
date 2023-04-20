import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { QwikLogo } from '../icons/qwik';
import styles from './header.scss?inline';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <header>
      <div class="logo">
        <a href=".">
          <QwikLogo />
        </a>
      </div>
      <ul>
        <li>
          <Link href="/d3/">
            d3
          </Link>
        </li>
        <li>
          <Link href="/d3/ranked/">
            ranked(d3)
          </Link>
        </li>
        <li>
          <Link href="/flower/">
            Blow my mind 🤯
          </Link>
        </li>
        <li>
          <Link href="/delay-count/">delay counter</Link>
        </li>
        <li>
          <Link href="/mouse-moves/">mouse mover</Link>
        </li>
      </ul>
    </header>
  );
});
