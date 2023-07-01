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
              Budgily MENU
            </label>
            <ul tabIndex={0} class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
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

            </li>
          </ul>
        </div>
        <div class="navbar-end"></div>
      </div>
    </header>
  );
});
