import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 5,
  iterations: 20
};

export default function () {
  http.get('http://gateway:3000/health');
  sleep(0.1);
}
