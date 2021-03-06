/* eslint-disable no-unused-expressions */

import React from 'react'
import sinon from 'sinon'
import { mount } from 'enzyme'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import SockJsClient from '../../src/client.jsx'

describe('<SockJsClient /> -> connect', () => {
  it('Websocket is connected', (done) => {
    const mountedComponent = mount(<SockJsClient url='http://localhost:8089/handler'
      topics={['/topic/all']} onMessage={(msg) => { console.log(msg) }} />)

    setTimeout(() => {
      expect(mountedComponent.state().connected).to.be.true
      mountedComponent.unmount()
      done()
    }, 500)
  })

  it('Websocket is disconnected', (done) => {
    const mountedComponent = mount(<SockJsClient url='http://localhost:8089/handler'
      topics={['/topic/all']} onMessage={(msg) => { console.log(msg) }} />)

    setTimeout(() => {
      expect(mountedComponent.state().connected).to.be.true
      mountedComponent.instance().disconnect()
      verifyDisconnect()
    }, 500)

    const verifyDisconnect = () => {
      setTimeout(() => {
        expect(mountedComponent.state().connected).to.be.false
        expect(mountedComponent.instance().subscriptions.size).to.equal(0)
        mountedComponent.unmount()
        done()
      }, 100)
    }
  })

  it('Websocket is connected -> disconnected -> connected', (done) => {
    const mountedComponent = mount(<SockJsClient url='http://localhost:8089/handler'
      topics={['/topic/all']} onMessage={(msg) => { console.log(msg) }} />)

    setTimeout(() => {
      expect(mountedComponent.state().connected).to.be.true
      mountedComponent.instance().disconnect()
      verifyDisconnect()
    }, 500)

    const verifyDisconnect = () => {
      setTimeout(() => {
        expect(mountedComponent.state().connected).to.be.false
        expect(mountedComponent.instance().subscriptions.size).to.equal(0)
        mountedComponent.instance().connect()
        verifyConnect()
      }, 500)
    }

    const verifyConnect = () => {
      setTimeout(() => {
        expect(mountedComponent.state().connected).to.be.true
        expect(mountedComponent.instance().subscriptions.size).to.equal(1)
        // No error when connect called even if already connected
        mountedComponent.instance().connect()
        mountedComponent.unmount()
        done()
      }, 100)
    }
  })

  it('After ERROR frame received', (done) => {
    const messageHandler = sinon.spy()
    const disconnectHandler = sinon.spy()
    const mountedComponent = mount(<SockJsClient url='http://localhost:8089/handler'
      topics={['/topic/all']} onMessage={messageHandler}
      onDisconnect={disconnectHandler} autoReconnect={false} />)

    setTimeout(() => {
      mountedComponent.instance().sendMessage('/app/err', 'groot erred')
      validateErred()
    }, 200)

    const validateErred = () => {
      setTimeout(() => {
        expect(mountedComponent.state().connected).to.be.false
        expect(mountedComponent.instance().subscriptions.size).to.equal(0)
        expect(disconnectHandler.callCount).to.equal(1)
        expect(messageHandler.callCount).to.equal(0)
        mountedComponent.unmount()
        done()
      }, 200)
    }
  })
})
