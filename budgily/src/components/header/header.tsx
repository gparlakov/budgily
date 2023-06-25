import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './header.scss?inline';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <header>
      <div class="navbar bg-base-100">
        <div class="navbar-start">
          <div class="dropdown">
            <label tabIndex={0} class="text-xl">
              Budgily
            </label>
            <ul tabIndex={0} class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <Link href="/reports/chart">
                  📊 chart
                </Link>
              </li>
              <li>
                <Link href="/reports/grid">
                  📑  grid
                </Link>
              </li>

              <li>
                <a>Deprecated</a>
                <ul class="p-2">
                  <li><Link href="/deprecated/d3">d3</Link></li>
                  <li><Link href="/deprecated/delay-count">delay-count</Link></li>
                  <li><Link href="/deprecated/flower">flower</Link></li>
                  <li><Link href="/deprecated/mouse-moves">mouse-moves</Link></li>
                </ul>
              </li>
            </ul>
          </div>

        </div>
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li>
              <Link href="/reports">
                📊 chart
              </Link>
            </li>
            <li>
              <Link href="/reports">
                📑  grid
              </Link>
            </li>
            <li tabIndex={0}>
              <details>
                <summary>Deprecated</summary>
                <ul class="p-2">
                  <li><Link href="/deprecated/d3">d3</Link></li>
                  <li><Link href="/deprecated/delay-count">delay-count</Link></li>
                  <li><Link href="/deprecated/flower">flower</Link></li>
                  <li><Link href="/deprecated/mouse-moves">mouse-moves</Link></li>
                </ul>
              </details>

            </li>
          </ul>
        </div>
        <div class="navbar-end">
          /
        </div>
      </div>
    </header>
  );
});
