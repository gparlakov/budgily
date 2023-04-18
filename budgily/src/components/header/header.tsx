import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { QwikLogo } from '../icons/qwik';
import styles from './header.scss?inline';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  useStylesScoped$(styles);

  console.log(';;;')
  return (
    <header>
      <div class="logo">
        <a href=".">
          <QwikLogo />
        </a>
      </div>
      <ul>
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
