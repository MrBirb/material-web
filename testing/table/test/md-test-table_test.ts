/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../test-table.js';

import {Environment} from '@material/web/testing/environment.js';
import {html} from 'lit';

import {TestTableTemplate} from '../test-table.js';

describe('<md-test-table>', () => {
  const env = new Environment();

  it('should call template functions with each state', async () => {
    const template1 = {
      display: 'template1',
      render: jasmine.createSpy('template1').and.callFake(() => html``),
    };
    const template2 = {
      display: 'template2',
      render: jasmine.createSpy('template2').and.callFake(() => html``),
    };
    const templates = [template1, template2] as TestTableTemplate[];
    env.render(html`
      <md-test-table
        .states=${['A', 'B']}
        .templates=${templates}></md-test-table>
    `);

    await env.waitForStability();
    expect(template1.render).toHaveBeenCalledTimes(2);
    expect(template1.render.calls.argsFor(0)).toEqual(['A']);
    expect(template1.render.calls.argsFor(1)).toEqual(['B']);
    expect(template2.render).toHaveBeenCalledTimes(2);
    expect(template2.render.calls.argsFor(0)).toEqual(['A']);
    expect(template2.render.calls.argsFor(1)).toEqual(['B']);
  });
});
