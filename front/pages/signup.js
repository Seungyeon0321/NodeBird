import React, { useCallback, useState, useEffect } from "react";
import AppLayout from "../component/layout";
import Router from "next/router";
import Head from "next/head";
import { Button, Checkbox, Form, Input } from "antd";
import CommonUserForm from "../hooks/useInput";
import styled from "styled-components";
import { SIGN_UP_REQUEST, LOAD_MY_INFO_REQUEST } from "../reducers/user";
import { LOAD_POST_REQUEST } from "../reducers/post";
import { useDispatch, useSelector } from "react-redux";
import { END } from "redux-saga";
import axios from "axios";
import wrapper from "../store/configureStore";

const ErrorMessage = styled.div`
  color: "blue";
`;

const SingUp = () => {
  const dispatch = useDispatch();
  const { isSigningUp, isSignedUp, signUpError, me } = useSelector(
    (state) => state.user
  );

  //login이 되면 회원가입 창이 없어지게 하도록 한다
  useEffect(() => {
    if (!(me && me.id)) {
      Router.replace("./");
    }
  }, [me && me.id]);

  useEffect(() => {
    if (isSignedUp) {
      Router.replace("/");
    }
  }, [isSignedUp]);

  useEffect(() => {
    if (signUpError) {
      alert(signUpError);
    }
  }, [signUpError]);

  const [email, onChangeEmail] = CommonUserForm(""); //포인트는 이 부분이 공백으로 들어간다는것
  const [password, onChangePassword] = CommonUserForm("");
  const [nickname, onChangeNickName] = CommonUserForm("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      //아래의 state를 추가함으로써 현재 typing하고 있는 녀석이
      //위에 작성한 password가 동일한지 실시간으로 알 수 있다
      setPasswordError(e.target.value !== password);
    },
    [password]
  );

  const [term, setTerm] = useState("");
  const [termError, setTermError] = useState(false);

  const onChangeTerm = useCallback(
    (e) => {
      setTerm(e.target.checked);
      setTermError(false);
    },
    [term]
  );

  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      return setTermError(true);
    }
    dispatch({
      type: SIGN_UP_REQUEST,
      data: { email, password, nickname },
    });
  }, [email, passwordCheck, term]);

  return (
    <AppLayout>
      <Head>
        <title>SignUp | Node Bird</title>
      </Head>
      <Form onFinish={onSubmit}>
        <div>
          <label htmlFor="user-email">User Email</label>
          <br />
          <Input
            name="user-email"
            type="email"
            value={email}
            onChange={onChangeEmail}
            required
          />
        </div>
        <div>
          <label htmlFor="user-nick">Nick Name</label>
          <br />
          <Input
            name="user-nick"
            value={nickname}
            onChange={onChangeNickName}
            required
          />
        </div>
        <div>
          <label htmlFor="user-password">Password</label>
          <br />
          <Input
            name="user-password"
            value={password}
            onChange={onChangePassword}
            required
          ></Input>
        </div>
        <div>
          <label htmlFor="user-id">Confirm Password</label>
          <br />
          <Input
            name="user-id"
            value={passwordCheck}
            onChange={onChangePasswordCheck}
            required
          ></Input>
          {passwordError && (
            <ErrorMessage>The password is not valid</ErrorMessage>
          )}
        </div>
        <div>
          {termError && (
            <div style={{ color: "red" }}>
              You must agree with the time of terms
            </div>
          )}
          <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>
            I agree with the terms
          </Checkbox>
        </div>
        <div style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit" loading={isSigningUp}>
            Sing Up
          </Button>
        </div>
      </Form>
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (context) => {
    const cookie = context.req ? context.req.headers.cookie : "";
    axios.defaults.headers.Cookie = "";
    if (context.req && cookie) {
      axios.defaults.headers.Cookie = cookie;
    }

    store.dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });
    store.dispatch({
      type: LOAD_POST_REQUEST,
    });
    store.dispatch(END);
    await store.sagaTask.toPromise();
  }
);

export default SingUp;